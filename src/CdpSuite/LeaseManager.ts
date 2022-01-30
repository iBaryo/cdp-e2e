import {LeaseInfo} from "../WFS/LeaseInfo";
import {TestBusinessUnitManager, WFS, WFSOptions} from "../WFS";
import {CredentialsType} from "../SDK/Signers";
import {CDP} from "../SDK";
import {IWFS} from "../WFS/WFS";
import promisify from "cypress-promise";

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
                    return promisify(cy.request({
                        method: req.method,
                        url: req.uri,
                        headers: {
                            ...req.headers,
                            [`Content-type`]: `application/json`,
                            [`X-Gigya-Test-Name`]: `UNIVERSE-E2E`,
                            // [`X-Gigya-Test-LeaseId`]: ``
                        },
                        body: req.body,
                        // timeout: 40000,
                        // retryOnNetworkFailure: true,
                        // retryOnStatusCodeFailure: true,
                        gzip: true,
                        log: true,
                        // failOnStatusCode: true
                        // followRedirect: false
                    })).then(res => {
                        return res.body as T;
                    });
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
    let yargs: { argv: any };
    try {
        yargs = require('yargs/yargs');
    } catch (e) {
        console.log('no cli args');
    }

    try {
        const {userKey, secret} = yargs?.argv ?? {};
        const wfsCreds: CredentialsType = userKey && secret ? {userKey, secret} : require('../../wfsCreds.json');
        return wfsCreds;
    } catch (e) {
        console.error(e);
        throw 'missing credentials for WFS - either via command-line args (userKey + secret) or via wfsCreds.json';
    }
}
