import {IWFS} from "./WFS";
import {Lease} from "./Lease";
import {LeaseInfo} from "./LeaseInfo";

export class TestBusinessUnitManager implements IWFS {
    constructor(private leaseInfo: LeaseInfo, options?: {
        clean?: () => ReturnType<IWFS['clean']>;
    }) {
        this.clean = options?.clean ?? this.clean;
    }

    public async clean(): Promise<void> {
    }

    public async lease(): Promise<Lease> {
        return new Lease({
            id: 'test',
            created: new Date(),
            ...this.leaseInfo,
        }, this);
    }

    public async release(): Promise<void> {
    }
}
