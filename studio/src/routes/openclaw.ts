import { Router, type NextFunction, type Request, type Response } from "express";

import { HttpError } from "../errors/http-error";
import type { DigitalHumanList } from "../types/digital-human";
import type { OpenClawAgentsListResult } from "../types/openclaw";
import type { OpenClawAgentsService } from "../services/openclaw-agents-service";

/**
 * Returns the OpenClaw agent list over HTTP.
 *
 * @param client The OpenClaw gateway reader used by the route.
 * @param _request The incoming HTTP request.
 * @param response The outgoing HTTP response.
 * @param next The next middleware callback.
 * @returns Nothing. The response is written directly.
 */
export async function getDigitalHumans(
  service: OpenClawAgentsService,
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await service.listAgents();

    response.status(200).json(mapAgentsToDigitalHumans(result));
  } catch (error) {
    next(
      error instanceof HttpError
        ? error
        : new HttpError(502, "Failed to query digital humans")
    );
  }
}

/**
 * Builds the OpenClaw router.
 *
 * @param service The service used by the route.
 * @returns The router exposing OpenClaw endpoints.
 */
export function createOpenClawRouter(service: OpenClawAgentsService): Router {
  const router = Router();

  router.get("/api/dip-studio/v1/digital-human", (request, response, next) => {
    return getDigitalHumans(service, request, response, next);
  });

  return router;
}

/**
 * Maps the OpenClaw agents payload to the public digital human schema.
 *
 * @param result The OpenClaw agents list result.
 * @returns The normalized digital human list.
 */
export function mapAgentsToDigitalHumans(
  result: OpenClawAgentsListResult
): DigitalHumanList {
  return result.agents.map((agent) => ({
    id: agent.id,
    name: agent.name ?? agent.identity?.name ?? agent.id,
    avatar: agent.identity?.avatarUrl ?? agent.identity?.avatar
  }));
}
