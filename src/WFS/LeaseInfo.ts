import {BusinessUnitId, WorkspaceId} from "../sdk/entities";
import {SecretCredentials} from "../sdk/Signers/SimpleRequestSigner";
import {WorkspaceLease} from "./WorkspaceLease";

export interface LeaseInfo {
    workspaceId: WorkspaceId;
    bUnitId: BusinessUnitId;
    apiCredentials: SecretCredentials;
    loginCredentials: WorkspaceLease['Credentials']['userKeys']['Universe']['properties'];
}

export interface WFSLeaseInfo extends LeaseInfo {
    id: string;
    created: Date;
    duration?: number;
}
