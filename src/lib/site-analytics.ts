import { getMongoDb } from "@/lib/mongodb";

const SITE_ANALYTICS_COLLECTION_NAME = "siteAnalytics";
const TOTALS_DOCUMENT_ID = "site-totals";

type AnalyticsField = "pageViews" | "readingSeconds";

type SiteAnalyticsTotalsDocument = {
  _id: typeof TOTALS_DOCUMENT_ID;
  pageViews: number;
  readingSeconds: number;
  updatedAt: string;
};

type SiteAnalyticsDailyDocument = {
  _id: string;
  day: string;
  pageViews: number;
  readingSeconds: number;
  updatedAt: string;
};

export type SiteAnalyticsSummary = {
  totalPageViews: number;
  totalReadingSeconds: number;
  weeklyTrafficChange: number | null;
};

let indexesEnsured = false;

async function getSiteAnalyticsCollection() {
  const db = await getMongoDb();
  const collection = db.collection<
    SiteAnalyticsTotalsDocument | SiteAnalyticsDailyDocument
  >(SITE_ANALYTICS_COLLECTION_NAME);

  if (!indexesEnsured) {
    await collection.createIndex({ day: 1 }, { unique: true, sparse: true });
    indexesEnsured = true;
  }

  return collection;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseOccurredAt(occurredAt?: string) {
  if (!occurredAt) {
    return new Date();
  }

  const parsedDate = new Date(occurredAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
}

async function incrementAnalyticsField(
  field: AnalyticsField,
  amount: number,
  occurredAt?: string,
) {
  const collection = await getSiteAnalyticsCollection();
  const eventDate = parseOccurredAt(occurredAt);
  const day = toDayKey(eventDate);
  const updatedAt = new Date().toISOString();
  const increment = { [field]: amount } as Record<AnalyticsField, number>;

  await Promise.all([
    collection.updateOne(
      { _id: TOTALS_DOCUMENT_ID },
      {
        $inc: increment,
        $set: {
          updatedAt,
        },
      },
      { upsert: true },
    ),
    collection.updateOne(
      { _id: `day:${day}` },
      {
        $inc: increment,
        $set: {
          day,
          updatedAt,
        },
      },
      { upsert: true },
    ),
  ]);
}

export async function recordSitePageView(occurredAt?: string) {
  await incrementAnalyticsField("pageViews", 1, occurredAt);
}

export async function recordSiteReadingTime(seconds: number, occurredAt?: string) {
  const normalizedSeconds = Math.max(1, Math.min(Math.round(seconds), 60 * 60));
  await incrementAnalyticsField("readingSeconds", normalizedSeconds, occurredAt);
}

function getTrailingDays(totalDays: number) {
  const today = new Date();
  const days: string[] = [];

  for (let offset = 0; offset < totalDays; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    days.push(toDayKey(date));
  }

  return days;
}

function sumDailyViews(days: string[], viewMap: Map<string, number>) {
  return days.reduce((total, day) => total + (viewMap.get(day) ?? 0), 0);
}

export async function getSiteAnalyticsSummary(): Promise<SiteAnalyticsSummary> {
  const collection = await getSiteAnalyticsCollection();
  const trailingDays = getTrailingDays(14);

  const [totalsDocument, dailyDocuments] = await Promise.all([
    collection.findOne({ _id: TOTALS_DOCUMENT_ID }),
    collection
      .find({
        day: {
          $in: trailingDays,
        },
      })
      .toArray(),
  ]);

  const totalPageViews =
    totalsDocument && "pageViews" in totalsDocument ? totalsDocument.pageViews : 0;
  const totalReadingSeconds =
    totalsDocument && "readingSeconds" in totalsDocument
      ? totalsDocument.readingSeconds
      : 0;

  const dailyViews = new Map(
    dailyDocuments
      .filter((document): document is SiteAnalyticsDailyDocument => "day" in document)
      .map((document) => [document.day, document.pageViews ?? 0]),
  );

  const currentWeekViews = sumDailyViews(trailingDays.slice(0, 7), dailyViews);
  const previousWeekViews = sumDailyViews(trailingDays.slice(7, 14), dailyViews);
  const weeklyTrafficChange =
    previousWeekViews > 0
      ? Math.round(((currentWeekViews - previousWeekViews) / previousWeekViews) * 100)
      : null;

  return {
    totalPageViews,
    totalReadingSeconds,
    weeklyTrafficChange,
  };
}
