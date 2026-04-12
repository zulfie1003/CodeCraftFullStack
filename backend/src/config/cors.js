// // // config/cors.js

// const allowedOrigins = [
//   "https://codecraft-frontend-9qqk.onrender.com",
//   "http://localhost:5173",
//   "http://localhost:3000"
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// export default corsOptions;
// config/cors.js

const envOrigins = [
  process.env.FRONTEND_URLS || "",
  process.env.FRONTEND_URL || ""
]
  .flatMap((value) => value.split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "https://codecraft-frontend-9qqk.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  ...envOrigins
]);

const isAllowedDevOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === "http:" && ["localhost", "127.0.0.1"].includes(hostname);
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests or tools like Postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin) || isAllowedDevOrigin(origin)) {
      return callback(null, true);
    }

    console.error(` CORS blocked for origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ],

  optionsSuccessStatus: 200
};

export default corsOptions;
