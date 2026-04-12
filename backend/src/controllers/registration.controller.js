import Event from "../models/Event.model.js";
import Registration from "../models/Registration.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { ensureStudentProfile, normalizeStringArray } from "../utils/studentProfile.js";

const REGISTRATION_POPULATE = [
  {
    path: "event",
    populate: {
      path: "organizer",
      select: "name email",
    },
  },
  {
    path: "student",
    populate: {
      path: "user",
      select: "name email role",
    },
  },
];

const normalizeTeamMembers = (value) => normalizeStringArray(value).slice(0, 9);

export const createRegistration = async (req, res, next) => {
  try {
    const { eventId, teamName = "", teamMembers = [], submissionUrl = "" } = req.body;

    if (!eventId) {
      return sendError(res, "eventId is required", 400);
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    if (event.status !== "open") {
      return sendError(res, "This event is not accepting registrations", 400);
    }

    if (new Date(event.deadline).getTime() < Date.now()) {
      return sendError(res, "Registration deadline has passed for this event", 400);
    }

    const studentProfile = await ensureStudentProfile(req.user.id);

    if (!studentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    const members = normalizeTeamMembers(teamMembers);
    const totalTeamSize = 1 + members.length;

    if (totalTeamSize > event.teamSizeLimit) {
      return sendError(
        res,
        `This event allows at most ${event.teamSizeLimit} members per team`,
        400
      );
    }

    const existingRegistration = await Registration.findOne({
      event: event._id,
      student: studentProfile._id,
    });

    if (existingRegistration) {
      return sendError(res, "You have already registered for this event", 400);
    }

    const registration = await Registration.create({
      event: event._id,
      student: studentProfile._id,
      teamName: String(teamName || "").trim(),
      teamMembers: members,
      submissionUrl: String(submissionUrl || "").trim(),
    });

    const populatedRegistration = await Registration.findById(registration._id).populate(
      REGISTRATION_POPULATE
    );

    sendSuccess(
      res,
      { registration: populatedRegistration },
      "Registration submitted successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const studentProfile = await ensureStudentProfile(req.user.id);

    if (!studentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    const registrations = await Registration.find({ student: studentProfile._id })
      .populate(REGISTRATION_POPULATE)
      .sort({ createdAt: -1 });

    sendSuccess(res, { registrations }, "Registrations retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getOrganizerRegistrations = async (req, res, next) => {
  try {
    const { eventId, status, search } = req.query;
    const organizerEvents = await Event.find({ organizer: req.user.id }).select("_id");
    const organizerEventIds = organizerEvents.map((event) => event._id);

    if (!organizerEventIds.length) {
      return sendSuccess(res, { registrations: [] }, "Registrations retrieved successfully");
    }

    const filter = { event: { $in: organizerEventIds } };

    if (eventId) {
      const requestedEventId = organizerEventIds.find((id) => String(id) === String(eventId));

      if (!requestedEventId) {
        return sendError(res, "Not authorized to view registrations for this event", 403);
      }

      filter.event = requestedEventId;
    }

    if (status) {
      filter.status = String(status).trim().toLowerCase();
    }

    const registrations = await Registration.find(filter)
      .populate(REGISTRATION_POPULATE)
      .sort({ createdAt: -1 });

    const filteredRegistrations = registrations.filter((registration) => {
      if (!search) {
        return true;
      }

      const haystack = [
        registration.event?.name,
        registration.student?.name,
        registration.student?.email,
        registration.teamName,
        ...(registration.teamMembers || []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(String(search).toLowerCase());
    });

    sendSuccess(
      res,
      { registrations: filteredRegistrations },
      "Registrations retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const nextStatus = String(status || "").trim().toLowerCase();

    if (!["pending", "shortlisted", "rejected"].includes(nextStatus)) {
      return sendError(res, "Status must be pending, shortlisted, or rejected", 400);
    }

    const registration = await Registration.findById(req.params.id).populate("event");

    if (!registration) {
      return sendError(res, "Registration not found", 404);
    }

    if (String(registration.event?.organizer) !== String(req.user.id) && req.user.role !== "admin") {
      return sendError(res, "Not authorized to update this registration", 403);
    }

    registration.status = nextStatus;
    await registration.save();

    const populatedRegistration = await Registration.findById(registration._id).populate(
      REGISTRATION_POPULATE
    );

    sendSuccess(
      res,
      { registration: populatedRegistration },
      "Registration status updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateRegistrationTeam = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate("event");

    if (!registration) {
      return sendError(res, "Registration not found", 404);
    }

    if (String(registration.event?.organizer) !== String(req.user.id) && req.user.role !== "admin") {
      return sendError(res, "Not authorized to update this registration", 403);
    }

    const members = normalizeTeamMembers(req.body.teamMembers);
    const totalTeamSize = 1 + members.length;

    if (totalTeamSize > registration.event.teamSizeLimit) {
      return sendError(
        res,
        `This event allows at most ${registration.event.teamSizeLimit} members per team`,
        400
      );
    }

    registration.teamName = String(req.body.teamName || "").trim();
    registration.teamMembers = members;

    await registration.save();

    const populatedRegistration = await Registration.findById(registration._id).populate(
      REGISTRATION_POPULATE
    );

    sendSuccess(
      res,
      { registration: populatedRegistration },
      "Registration team updated successfully"
    );
  } catch (error) {
    next(error);
  }
};
