const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Content = require("../models/Content");
const Progress = require("../models/Progress");
const { hasActiveBatchAccess } = require("../utils/learningAccess");

const parseMetadataPayload = (value) => {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return { note: String(value) };
  }
};

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() !== "false";
  }

  return Boolean(value);
};

const ensureSubject = async ({
  subjectId,
  subjectTitle,
  batchId,
  courseId,
  createdBy,
}) => {
  if (subjectId) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      const error = new Error("Subject not found.");
      error.status = 404;
      throw error;
    }
    return subject;
  }

  if (!subjectTitle?.trim()) {
    const error = new Error("subjectId or subjectTitle is required.");
    error.status = 400;
    throw error;
  }

  const normalizedTitle = subjectTitle.trim();
  let subject = await Subject.findOne({
    batchId,
    subjectname: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
  });

  if (!subject) {
    subject = await Subject.create({
      subjectname: normalizedTitle,
      title: normalizedTitle,
      batchId,
      courseId,
      createdBy,
      status: "active",
    });
  }

  return subject;
};

const ensureChapter = async ({
  chapterId,
  chapterTitle,
  batchId,
  subjectId,
  createdBy,
}) => {
  if (chapterId) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      const error = new Error("Chapter not found.");
      error.status = 404;
      throw error;
    }
    return chapter;
  }

  if (!chapterTitle?.trim()) {
    const error = new Error("chapterId or chapterTitle is required.");
    error.status = 400;
    throw error;
  }

  const normalizedTitle = chapterTitle.trim();
  let chapter = await Chapter.findOne({
    batchId,
    subjectId,
    title: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
  });

  if (!chapter) {
    chapter = await Chapter.create({
      title: normalizedTitle,
      batchId,
      subjectId,
      createdBy,
      status: "active",
    });
  }

  return chapter;
};

const populateContent = (query) =>
  query
    .populate("batchId", "batchName batchCode thumbnail mode duration course")
    .populate("subjectId", "subjectname title order")
    .populate("chapterId", "title order");

const shapeBatchContentTree = ({
  batch,
  contents,
  subjectsMeta = [],
  chaptersMeta = [],
  progressByContentId = new Map(),
}) => {
  const subjectMap = new Map();

  subjectsMeta.forEach((subject) => {
    const subjectId = String(subject._id);
    subjectMap.set(subjectId, {
      _id: subjectId,
      title: subject.title || subject.subjectname || "Untitled Subject",
      order: subject.order || 0,
      chapters: [],
    });
  });

  chaptersMeta.forEach((chapter) => {
    const subjectId = String(chapter.subjectId);
    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        _id: subjectId,
        title: "Untitled Subject",
        order: 0,
        chapters: [],
      });
    }

    const subject = subjectMap.get(subjectId);
    const chapterId = String(chapter._id);
    const exists = subject.chapters.some((entry) => entry._id === chapterId);
    if (!exists) {
      subject.chapters.push({
        _id: chapterId,
        title: chapter.title || "Untitled Chapter",
        order: chapter.order || 0,
        items: [],
      });
    }
  });

  contents.forEach((item) => {
    const content = item.toObject ? item.toObject() : item;
    const subjectId = String(content.subjectId?._id || content.subjectId);
    const chapterId = String(content.chapterId?._id || content.chapterId);
    const progress = progressByContentId.get(String(content._id)) || null;

    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        _id: subjectId,
        title: content.subjectId?.title || content.subjectId?.subjectname || "Untitled Subject",
        order: content.subjectId?.order || 0,
        chapters: [],
      });
    }

    const subject = subjectMap.get(subjectId);
    let chapter = subject.chapters.find((entry) => entry._id === chapterId);

    if (!chapter) {
      chapter = {
        _id: chapterId,
        title: content.chapterId?.title || "Untitled Chapter",
        order: content.chapterId?.order || 0,
        items: [],
      };
      subject.chapters.push(chapter);
    }

    chapter.items.push({
      ...content,
      progress,
    });
  });

  const subjects = Array.from(subjectMap.values())
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map((subject) => ({
      ...subject,
      chapters: subject.chapters
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
        .map((chapter) => ({
          ...chapter,
          items: chapter.items.sort(
            (a, b) =>
              a.order - b.order ||
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        })),
    }));

  const flatItems = subjects.flatMap((subject) =>
    subject.chapters.flatMap((chapter) => chapter.items)
  );

  return {
    batch,
    subjects,
    flatItems,
  };
};

const createContent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      resourceFormat,
      url,
      thumbnail,
      thumbnailUploadedPath,
      batchId,
      subjectId,
      subjectTitle,
      chapterId,
      chapterTitle,
      duration,
      order,
      metadata,
      isPublished,
    } = req.body;

    if (!title?.trim() || !type || !url?.trim() || !batchId) {
      return res.status(400).json({
        success: false,
        message: "title, type, url and batchId are required.",
      });
    }

    const batch = await Batch.findById(batchId).populate("course", "_id");
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    const subject = await ensureSubject({
      subjectId,
      subjectTitle,
      batchId,
      courseId: batch.course?._id || batch.course || null,
      createdBy: req.user?._id || null,
    });

    const chapter = await ensureChapter({
      chapterId,
      chapterTitle,
      batchId,
      subjectId: subject._id,
      createdBy: req.user?._id || null,
    });

    const content = await Content.create({
      title: title.trim(),
      description: description?.trim() || "",
      type,
      resourceFormat:
        resourceFormat || (type === "video" || type === "solution" ? "video" : "pdf"),
      url: url.trim(),
      thumbnail: thumbnailUploadedPath || thumbnail?.trim() || batch.thumbnail || "",
      batchId,
      subjectId: subject._id,
      chapterId: chapter._id,
      duration: Number(duration) || 0,
      order: Number(order) || 0,
      metadata: parseMetadataPayload(metadata),
      isPublished: parseBoolean(isPublished, true),
      createdBy: req.user?._id || null,
    });

    const populatedContent = await populateContent(Content.findById(content._id));

    return res.status(201).json({
      success: true,
      message: "Content created successfully.",
      data: populatedContent,
    });
  } catch (error) {
    next(error);
  }
};

const getBatchMeta = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const [batch, subjects, chapters] = await Promise.all([
      Batch.findById(batchId).select("batchName course"),
      Subject.find({ batchId, status: "active" })
        .select("title subjectname order")
        .sort({ order: 1, createdAt: 1 })
        .lean(),
      Chapter.find({ batchId, status: "active" })
        .select("title subjectId order")
        .sort({ order: 1, createdAt: 1 })
        .lean(),
    ]);

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    const chapterMap = chapters.reduce((acc, chapter) => {
      const key = String(chapter.subjectId);
      acc[key] = acc[key] || [];
      acc[key].push(chapter);
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        batch,
        subjects: subjects.map((subject) => ({
          _id: subject._id,
          title: subject.title || subject.subjectname,
          order: subject.order || 0,
          chapters: (chapterMap[String(subject._id)] || []).map((chapter) => ({
            _id: chapter._id,
            title: chapter.title,
            order: chapter.order || 0,
          })),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getContentByBatch = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId)
      .populate("course", "title thumbnail")
      .lean();

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    if (req.userRole !== "admin") {
      const hasAccess = await hasActiveBatchAccess(req.userId, batchId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this batch.",
        });
      }
    }

    const filter = { batchId };
    if (req.userRole !== "admin") {
      filter.$or = [{ isPublished: true }, { isPublished: { $exists: false } }];
    }

    const [contents, progressRows, subjectsMeta, chaptersMeta] = await Promise.all([
      populateContent(Content.find(filter).sort({ order: 1, createdAt: 1 })),
      req.userRole === "admin"
        ? []
        : Progress.find({ userId: req.userId })
            .select("contentId watchedTime completed lastAccessed")
            .lean(),
      Subject.find({ batchId, status: "active" })
        .select("title subjectname order")
        .sort({ order: 1, createdAt: 1 })
        .lean(),
      Chapter.find({ batchId, status: "active" })
        .select("title subjectId order")
        .sort({ order: 1, createdAt: 1 })
        .lean(),
    ]);

    const progressByContentId = new Map(
      progressRows.map((item) => [String(item.contentId), item])
    );

    const tree = shapeBatchContentTree({
      batch,
      contents,
      subjectsMeta,
      chaptersMeta,
      progressByContentId,
    });

    const continueWatching = [...tree.flatItems]
      .filter((item) => item.type === "video" && item.progress?.lastAccessed)
      .sort(
        (a, b) =>
          new Date(b.progress.lastAccessed).getTime() -
          new Date(a.progress.lastAccessed).getTime()
      )[0] || null;

    return res.json({
      success: true,
      data: {
        ...tree,
        continueWatching,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getContentById = async (req, res, next) => {
  try {
    const content = await populateContent(Content.findById(req.params.id));
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found." });
    }

    return res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

const getRecentlyViewed = async (req, res, next) => {
  try {
    const rows = await Progress.find({
      userId: req.userId,
      lastAccessed: { $ne: null },
    })
      .sort({ lastAccessed: -1 })
      .limit(10)
      .populate({
        path: "contentId",
        populate: [
          { path: "batchId", select: "batchName thumbnail" },
          { path: "subjectId", select: "title subjectname" },
          { path: "chapterId", select: "title" },
        ],
      })
      .lean();

    const data = rows
      .filter((item) => item.contentId)
      .map((item) => ({
        ...item.contentId,
        progress: {
          watchedTime: item.watchedTime,
          completed: item.completed,
          lastAccessed: item.lastAccessed,
        },
      }));

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContent,
  getBatchMeta,
  getContentByBatch,
  getContentById,
  getRecentlyViewed,
  updateContent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body };
      delete payload._id;
      if (payload.metadata !== undefined) {
        payload.metadata = parseMetadataPayload(payload.metadata);
      }
      if (payload.isPublished !== undefined) {
        payload.isPublished = parseBoolean(payload.isPublished, true);
      }
      if (payload.order !== undefined) {
        payload.order = Number(payload.order) || 0;
      }
      if (payload.duration !== undefined) {
        payload.duration = Number(payload.duration) || 0;
      }
      if (payload.thumbnailUploadedPath) {
        payload.thumbnail = payload.thumbnailUploadedPath;
      } else if (typeof payload.thumbnail === "string") {
        payload.thumbnail = payload.thumbnail.trim();
      }
      delete payload.thumbnailUploadedPath;

      const content = await Content.findByIdAndUpdate(id, payload, { new: true });
      if (!content) {
        return res.status(404).json({ success: false, message: "Content not found." });
      }

      const populatedContent = await populateContent(Content.findById(content._id));
      return res.json({ success: true, data: populatedContent });
    } catch (error) {
      next(error);
    }
  },
  deleteContent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await Content.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Content not found." });
      }

      await Progress.deleteMany({ contentId: id });
      return res.json({ success: true, message: "Content deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};
