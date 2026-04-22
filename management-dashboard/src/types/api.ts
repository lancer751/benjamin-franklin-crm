import type { benjaminCrmApi } from "../lib/apiConnection"

export type UsersRes = Awaited<ReturnType<typeof benjaminCrmApi.users.$get>>
export type PublicUser = Awaited<ReturnType<UsersRes["json"]>>[number]