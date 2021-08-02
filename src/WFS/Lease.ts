import {CDP} from "../sdk";
import {WFSLeaseInfo} from "./LeaseInfo";

export interface LeaseManager {
    clean(leaseId: string): Promise<void>;
    release(leaseId: string): Promise<void>;
}

export type LeaseBusinessUnit = Lease['businessUnit'];

export class Lease {
    private readonly _sdk: CDP;
    private _isReleased = false;

    constructor(private leaseInfo: WFSLeaseInfo, private leaseManager: LeaseManager) {
        this._sdk = new CDP(leaseInfo.apiCredentials);
    }

    private readonly sdkOpsProxyHandler = {
        get: (sdkOps, prop) => { // important to keep as an arrow function!
            if (this.isExpired()) {
                this.release(); // fire and forget
                throw `couldn't access "${prop}" because lease expired (lease id: ${this.id})`;
            }
            return new Proxy(sdkOps[prop], this.sdkOpsProxyHandler);
        }
    };

    public get loginCredentials() {
        return this.leaseInfo.loginCredentials;
    }

    public get businessUnit() {
        return new Proxy(
            this._sdk.api.businessunits.for(this.leaseInfo.bUnitId),
            this.sdkOpsProxyHandler);
    }

    public get connectors() {
        return new Proxy(
            this._sdk.api.workspaces.for(this.leaseInfo.workspaceId).applibrary,
            this.sdkOpsProxyHandler);
    }

    public get id() {
        return this.leaseInfo.id;
    }

    public get created() {
        return this.leaseInfo.created;
    }

    public get isReleased() {
        return this._isReleased;
    }

    public get duration() {
        return this.leaseInfo.duration;
    }

    public isExpired() {
        if (!this.duration)
            return false;

        return (this.created.getTime() + this.duration) < Date.now();
    }

    public async clean() {
        if (this.isExpired()) {
            throw `can't clean, lease is expired`;
        }
        if (!this.isReleased) {
            await this.leaseManager?.clean?.(this.id);
        }
    }

    public async release() {
        if (!this.isReleased) {
            await this.leaseManager?.release?.(this.id);
            this._isReleased = true;
        }
    }
}
