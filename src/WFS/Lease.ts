import {WorkspaceLease} from "./WorkspaceLease";
import {CDP} from "../sdk";
import {DurationUnit} from "./LeaseDuration";

interface LeaseManager {
    clean(leaseId: string): Promise<void>;
    release(leaseId: string): Promise<void>;
}

export type LeaseBusinessUnit = Lease['businessUnit'];

export class Lease {
    private readonly _sdk: CDP;
    private _isReleased = false;

    constructor(private wsLease: WorkspaceLease, private leaseManager: LeaseManager) {
        const creds = wsLease.Credentials.userKeys.Universe;
        this._sdk = new CDP({userKey: creds.userKey, secret: creds.userSecret});

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
        return this.wsLease.Credentials.userKeys.Universe.properties;
    }

    public get businessUnit() {
        return new Proxy(
            this._sdk.api.businessunits.for(this.wsLease.Info.businessUnitId),
            this.sdkOpsProxyHandler);
    }

    public get id() {
        return this.wsLease.id;
    }

    public get created() {
        return new Date(this.wsLease.Info.created);
    }

    public get isReleased() {
        return this._isReleased;
    }

    public get duration() {
        return parseInt(this.wsLease.Info.duration.replace(DurationUnit, ''));
    }

    public isExpired() {
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
