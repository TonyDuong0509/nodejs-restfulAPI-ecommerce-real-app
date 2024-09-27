const CustomError = require("./../errors");

const checkPermissions = (requestUer, resourceUserId) => {
  if (requestUer.role === "admin") return;
  if (requestUer.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError(
    "Not authorized to access this route"
  );
};

module.exports = checkPermissions;
