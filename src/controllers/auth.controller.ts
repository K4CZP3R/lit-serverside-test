import { NextFunction, Response, Request } from "express";
import { AuthLogic } from "../logic/auth.logic";
import { authRefreshMiddleware, authUserMiddleware, authUserTypeMiddleware } from "../middlewares/auth.middleware";
import { IRoute } from "../models/interfaces/route.interface";
import { BaseController } from "./base.controller";

export class AuthController extends BaseController {
	routes: IRoute[] = [
		{
			path: "/jwks",
			method: "GET",
			func: this.pathJwks.bind(this),
		},
		{
			path: "/email/register",
			method: "GET",
			func: this.pathEmailRegister.bind(this),
		},
		{
			path: "/email",
			method: "POST",
			func: this.pathEmailAuth.bind(this),
		},
		{
			path: "/api-key/register",
			method: "GET",
			func: this.pathApiKeyRegister.bind(this),
			middlewares: [authUserMiddleware]
		},
		{
			path: "/api-key/remove",
			method: "POST",
			func: this.pathApiKeyRemove.bind(this),
			middlewares: [authUserMiddleware]
		},
		{
			path: "/refresh",
			method: "GET",
			func: this.pathRefresh.bind(this),
			middlewares: [authRefreshMiddleware],
		},
		{
			path: "/me",
			method: "GET",
			func: this.pathMe.bind(this),
			middlewares: [authUserMiddleware],
		},
	];

	private _registerDisabled: boolean = false;

	constructor(private authLogic: AuthLogic = new AuthLogic()) {
		super({ path: "/auth" });
		this.loadRoutes();
	}

	// setter for registerDisabled
	get registerDisabled(): boolean {
		return this._registerDisabled;
	}

	set registerDisabled(value: boolean) {
		this._registerDisabled = value;
	}

	async pathApiKeyRemove(req: Request, res: Response, next: NextFunction) {
		let result = await this.authLogic.removeApiKey({ user: req["user"], apiKey: req.body.apiKey });
		res.json(result);
	}

	async pathApiKeyRegister(req: Request, res: Response, next: NextFunction) {
		let result = await this.authLogic.registerApiKey({ user: req["user"] })
		res.json(result);
	}

	async pathMe(req: Request, res: Response, next: NextFunction) {
		let result = await this.authLogic.meData({ user: req["user"] });
		res.json(result);
	}

	async pathRefresh(req: Request, res: Response, next: NextFunction) {
		let result = await this.authLogic.refreshToken({ user: req["user"] });
		res.json(result);
	}

	async pathEmailAuth(req: Request, res: Response, next: NextFunction) {
		let result = await this.authLogic.authenticateUsingEmail(req.body);
		res.json(result);
	}

	async pathEmailRegister(req: Request, res: Response, next: NextFunction) {
		if (this.registerDisabled) throw new Error("Registration is disabled!");
		let result = await this.authLogic.registerUsingEmail(req.body);

		res.json(result);
	}

	async pathJwks(req: Request, res: Response, next: NextFunction) {
		let result = await this.authLogic.getJwks();
		res.json(result);
	}
}
