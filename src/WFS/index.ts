import {CDP} from "../sdk";
import {CdpPermissionsGroups} from "./PermissionGroups";
import {WorkspaceLease} from "./WorkspaceLease";
import {DurationUnit} from "./LeaseDuration";
import {Lease} from "./Lease";

interface LeaseOptions {
    consoleUserGroup: CdpPermissionsGroups;
    duration: number;
}

export class WFS {
    private _activeLeases: Record<WorkspaceLease['id'], NodeJS.Timeout> = {};
    public get activeLeases() {
        return Object.keys(this._activeLeases).length;
    }

    private readonly DefaultLeaseOptions: LeaseOptions;

    constructor(private sdk: CDP, private options = {
        maxLeases: 1,
        defaults: {
            leaseDuration: 1000 * 60 * 10, // 10min
            permissionGroup: CdpPermissionsGroups._cdp_sys_admin
        }
    }) {
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
                duration: `${DurationUnit}${leaseOptions.duration}` // backend required transformation
            })

        this._activeLeases[wsLease.id] = setTimeout(() => {
            // TODO: need to think about this.
            return process.exit();
        }, leaseOptions.duration);
        return wsLease;
    }

    public async lease(permissionGroup?: CdpPermissionsGroups) {
        if (this.activeLeases >= this.options.maxLeases)
            throw 'max leases reached';
        const wsLease = await this.directLease({consoleUserGroup: permissionGroup});
        return new Lease(wsLease, this);
    }
}
