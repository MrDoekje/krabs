import { createKrabsSDK } from "@/krabs-sdk/krabsSDK"
import { DefaultRequestAdapter, } from "@microsoft/kiota-bundle"
import {AnonymousAuthenticationProvider} from "@microsoft/kiota-abstractions"

// move to composables
export const useKrabsSdk = () => {
    const authenticationProvider = new AnonymousAuthenticationProvider()
    const requestAdapter = new DefaultRequestAdapter(authenticationProvider)
    requestAdapter.baseUrl = '/api'
    const krabsSDk = createKrabsSDK(requestAdapter)
    return krabsSDk
}