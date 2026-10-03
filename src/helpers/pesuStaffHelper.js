import * as cheerio from "cheerio";

const PROSE_LINE_BREAK = " ";

const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim();

const toAbsoluteUrl = (path, baseUrl) => (path ? new URL(path, baseUrl).href : undefined);

const collectTexts = ($, elements) =>
  elements
    .toArray()
    .map((element) => normalizeText($(element).text()))
    .filter(Boolean);

export const parseStaffSearchResults = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const grid = $("#staffGrid");

  if (grid.length === 0 && $("main .empty-state").length === 0) {
    throw new Error("Could not read faculty search results");
  }

  const professors = grid
    .find("a.s-card")
    .toArray()
    .map((card) => {
      const $card = $(card);
      return {
        id: $card.attr("href"),
        name: normalizeText($card.find(".s-body h3").text()),
        designation: normalizeText($card.find(".s-desig").text()),
        imageUrl: toAbsoluteUrl($card.find(".s-photo img").attr("src"), baseUrl),
      };
    })
    .filter((professor) => professor.id && professor.name);

  const pageNumbers = $("#pagination .page-btn")
    .toArray()
    .map((button) => Number.parseInt($(button).text(), 10))
    .filter(Number.isFinite);

  return {
    professors,
    totalPages: pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1,
  };
};

const parseBasicInfo = ($, baseUrl) => {
  const basicInfo = {};
  const hero = $(".p-hero");

  const name = normalizeText(hero.find(".p-name").text());
  if (name) basicInfo["Name"] = name;

  const designation = normalizeText(hero.find(".p-role").text());
  if (designation) basicInfo["Designation"] = designation;

  const imageUrl = toAbsoluteUrl(hero.find(".p-photo img").attr("src"), baseUrl);
  if (imageUrl) basicInfo["Image URL"] = imageUrl;

  return basicInfo;
};

const parseContactDetails = ($) => {
  const details = {};
  $(".sidebar .contact-row").each((_, row) => {
    const label = normalizeText($(row).find(".lbl").text());
    const value = normalizeText($(row).find(".val").text());
    if (label && value) details[label] = value;
  });
  return details;
};

const extractProseLines = ($, prose) => {
  prose.find("br").replaceWith(PROSE_LINE_BREAK);
  const paragraphs = prose.find("p").length > 0 ? prose.find("p").toArray() : [prose.get(0)];

  return paragraphs
    .flatMap((paragraph) => $(paragraph).text().split(PROSE_LINE_BREAK))
    .map(normalizeText)
    .filter(Boolean);
};

const extractTimelineEntries = ($, timeline) =>
  timeline
    .children("li")
    .toArray()
    .map((entry) =>
      [".role", ".org", ".yr"]
        .map((selector) => normalizeText($(entry).find(selector).text()))
        .filter(Boolean)
        .join(" · ")
    )
    .filter(Boolean);

const extractBlockItems = ($, block) => {
  if (block.hasClass("num-list")) return collectTexts($, block.find("li .body"));
  if (block.hasClass("tag-list")) return collectTexts($, block.find("span"));
  if (block.hasClass("timeline")) return extractTimelineEntries($, block);
  if (block.hasClass("prose")) return extractProseLines($, block);
  if (block.hasClass("info-item")) return collectTexts($, block);
  return [];
};

const parseSectionGroups = ($, card, sectionTitle) => {
  const groups = {};
  let groupTitle = sectionTitle;

  card.children().each((_, child) => {
    const block = $(child);
    if (block.hasClass("card-sub")) {
      groupTitle = normalizeText(block.text()) || sectionTitle;
      return;
    }

    const items = extractBlockItems($, block);
    if (items.length > 0) {
      groups[groupTitle] = (groups[groupTitle] || []).concat(items);
    }
  });

  return groups;
};

const parseProfileSections = ($) => {
  const sections = {};
  $(".profile-layout .content-card").each((_, element) => {
    const card = $(element);
    const sectionTitle = normalizeText(card.find(".card-head h2").first().text());
    if (!sectionTitle) return;

    const groups = parseSectionGroups($, card, sectionTitle);
    if (Object.keys(groups).length > 0) {
      sections[sectionTitle.toLowerCase()] = groups;
    }
  });
  return sections;
};

export const parseStaffProfile = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const basicInfo = parseBasicInfo($, baseUrl);

  if (!basicInfo["Name"]) {
    throw new Error("Could not read faculty profile");
  }

  return {
    basicInfo,
    sidebar: parseContactDetails($),
    tabs: parseProfileSections($),
  };
};
