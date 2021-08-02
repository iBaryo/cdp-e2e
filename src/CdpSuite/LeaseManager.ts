import {LeaseInfo} from "../WFS/LeaseInfo";
import {TestBusinessUnitManager, WFS, WFSOptions} from "../WFS";
import {CredentialsType} from "../sdk/Signers";
import {CDP} from "../sdk";
import {IWFS} from "../WFS/WFS";

type SingleLease = { singleLease: true | LeaseInfo };
type WFSLease = { wfsOptions: WFSOptions };
export type LeaseManagerOptions = WFSLease | SingleLease;

function isSingleLease(leaseOptions: Partial<LeaseManagerOptions>): leaseOptions is SingleLease {
    return !!leaseOptions['singleLease'];
}

export function createLeaseManager(options: Partial<LeaseManagerOptions>): IWFS {
    if (isSingleLease(options)) {
        if (typeof options.singleLease == 'object') {
            return new TestBusinessUnitManager(options.singleLease);
        } else {
            try {
                return new TestBusinessUnitManager(require('../testBusinessUnit.json'));
            } catch (e) {
                throw 'missing or invalid testBusinessUnit.json according to LeaseInfo interface';
            }
        }
    } else {
        const wfsCreds = getWFSCreds();
        return new WFS(
            new CDP(wfsCreds, {
                sendRequest: async <T>(req, reqOptions) => {
                    // TODO: cy.request
                    // TODO: X-Gigya-Test-LeaseId header
                    return null;
                },
                verboseLog: true,
                // log(msg: string, ...args) {
                //     // TODO: logs?
                // }
            }),
            (options as Partial<WFSLease>).wfsOptions
        );
    }
}

function getWFSCreds() {
    const yargs = require('yargs/yargs')

    try {
        const {userKey, secret} = yargs.argv;
        const wfsCreds: CredentialsType = userKey && secret ? {userKey, secret} : require('../wfsCreds.json');
        return wfsCreds;
    } catch (e) {
        console.error(e);
        throw 'missing credentials for WFS - either via command-line args (userKey + secret) or via wfsCreds.json';
    }
}
