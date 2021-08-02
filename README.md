# CDP E2E

## Cloning and running
TBD
* cloning with submodules
* running with WFS creds / single bUnit

## Writing a new test
TBD

## Useful `Page` classes
TBD

## The `src` Directory
Here you can find the infrastructure code our tests use.  
* `SDK` - submodule for the cdp-node-sdk, used for api requests
    * Changes in the CDP models should be applied here.
* `WFS` - managing leasing test business-units from the `WorkspaceFactoryService`
    * Changes in leasing should be applied here.
* `CdpSuite` - the implementation of the functions that run our tests.
    * Changes in the lifecycle of tests should be applied here.
* `Pages` - the page objects' classes we use throughout our tests.
