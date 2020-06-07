import db from "../../db";
import log from "../../utils/log";
import HttpError from "../../exceptions/HttpError";
import HttpStatusCode from "../../utils/HttpStatusCode";

export default async (req, res, next) => {
  const { logbookId } = req.params;

  let logbook;

  try {
    logbook = await db.Logbook.findOne({
      where: { id: logbookId },
    });
  } catch (err) {
    log.error(`Error fetching logbook ${logbookId}, error ${err.message}`);
    return next(
      new HttpError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      )
    );
  }

  if (logbook === null) {
    return next(new HttpError(HttpStatusCode.NOT_FOUND, "Not Found"));
  }

  let logbookDetails;
  try {
    logbookDetails = await db.LogbookDetails.findAll({
      where: { logbook_id: logbook.id },
      order: [["created_at", "DESC"]],
    });
  } catch (err) {
    log.error(
      `Error fetching logbook details ${logbookId}, error ${err.message}`
    );
    return next(
      new HttpError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      )
    );
  }
  logbook.details = logbookDetails;

  return res.status(HttpStatusCode.OK).json(logbook);
};
