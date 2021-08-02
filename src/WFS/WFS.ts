import {CDP, PermissionsGroup} from "../SDK";
import {WorkspaceLease} from "./WorkspaceLease";
import {Lease, LeaseManager} from "./Lease";

interface LeaseOptions {
    consoleUserGroup: PermissionsGroup;
    duration: number;
}

export interface WFSOptions {
    maxLeases: number;
    defaults: {
        permissionGroup: PermissionsGroup;
        leaseDuration: number;
    }
}

export const DurationSecUnit = 'sec';

export const DefaultWFSOptions = {
    maxLeases: 1,
    defaults: {
        leaseDuration: 1000 * 60 * 10, // 10min
        permissionGroup: PermissionsGroup.sys_admins
    }
};

export interface IWFS extends LeaseManager {
    lease(permissionGroup?: PermissionsGroup): Promise<Lease>;
}

export class WFS implements IWFS {
    private _activeLeases: Record<WorkspaceLease['id'], NodeJS.Timeout> = {};
    public get activeLeases() {
        return Object.keys(this._activeLeases).length;
    }

    private readonly DefaultLeaseOptions: LeaseOptions;

    constructor(private sdk: CDP, public options = DefaultWFSOptions) {
        this.DefaultLeaseOptions = {
            consoleUserGroup: this.options.defaults.permissionGroup,
            duration: this.options.defaults.leaseDuration
        }
    }

    public clean(leaseId: string) {
        return this.sdk.get<void>(`wf2/workspace/clean/${leaseId}`);
    }

    public async release(leaseId: string) {
        await this.sdk.get<void>(`wf2/workspace/release/${leaseId}`);
        clearTimeout(this._activeLeases[leaseId]);
    }

    public async directLease(options?: Partial<LeaseOptions>) {
        const leaseOptions = Object.assign({}, this.DefaultLeaseOptions, options);
        const wsLease =
            await this.sdk.get<WorkspaceLease>(`wf2/workspace/lease`, {
                ...leaseOptions,
                duration: `${DurationSecUnit}${leaseOptions.duration}` // backend required transformation
            })

        this._activeLeases[wsLease.id] = setTimeout(() => {
            // TODO: need to think about this.
            return process.exit();
        }, leaseOptions.duration);
        return wsLease;
    }

    async lease(permissionGroup?: PermissionsGroup) {
        if (this.activeLeases > this.options.maxLeases)
            throw 'max leases reached';
        const wsLease = await this.directLease({consoleUserGroup: permissionGroup});
        return new Lease({
            id: wsLease.id,
            created: new Date(wsLease.Info.created),
            workspaceId: wsLease.Info.workspaceId,
            bUnitId: wsLease.Info.businessUnitId,
            duration: parseInt(wsLease.Info.duration.replace(DurationSecUnit, '')) * 1000,
            loginCredentials: wsLease.Credentials.userKeys.Universe.properties,
            apiCredentials: {
                userKey: wsLease.Credentials.userKeys.Universe.userKey,
                secret: wsLease.Credentials.userKeys.Universe.userSecret,
            },
        }, this);
    }
}
