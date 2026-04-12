import Event from "../models/Event.model.js";
import Registration from "../models/Registration.model.js";
import { sendError, sendSuccess } from "../utils/response.js";

const buildEventPayload = (payload = {}) => {
  const nextPayload = {};

  if ("name" in payload) nextPayload.name = String(payload.name || "").trim();
  if ("description" in payload) {
    nextPayload.description = String(payload.description || "").trim();
  }
  if ("theme" in payload) nextPayload.theme = String(payload.theme || "").trim();
  if ("rules" in payload) nextPayload.rules = String(payload.rules || "").trim();
  if ("teamSizeLimit" in payload) nextPayload.teamSizeLimit = Number(payload.teamSizeLimit);
  if ("deadline" in payload) nextPayload.deadline = new Date(payload.deadline);
  if ("status" in payload) nextPayload.status = String(payload.status || "").trim().toLowerCase();

  return nextPayload;
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...buildEventPayload(req.body),
      organizer: req.user.id,
    });

    sendSuccess(res, { event }, "Event created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = String(req.query.status).trim().toLowerCase();
    } else {
      filter.status = "open";
    }

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ deadline: 1, createdAt: -1 });

    sendSuccess(res, { events }, "Events retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort({ createdAt: -1 });

    const eventIds = events.map((event) => event._id);
    const registrations = await Registration.find({ event: { $in: eventIds } });
    const registrationsByEvent = registrations.reduce((accumulator, registration) => {
      const key = String(registration.event);
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    const enrichedEvents = events.map((event) => ({
      ...event.toObject(),
      registrationsCount: registrationsByEvent[String(event._id)] || 0,
    }));

    sendSuccess(res, { events: enrichedEvents }, "Organizer events retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email");

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    sendSuccess(res, { event }, "Event retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    if (String(event.organizer) !== String(req.user.id) && req.user.role !== "admin") {
      return sendError(res, "Not authorized to update this event", 403);
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, buildEventPayload(req.body), {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, { event: updatedEvent }, "Event updated successfully");
  } catch (error) {
    next(error);
  }
};
