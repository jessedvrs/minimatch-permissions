import * as minimatch from 'minimatch'
import 'core-js/fn/array/find'

export class Permissions {
    constructor(private options: PermissionsConfig) {}

    getPermissionList(): Array<string> {
        return this.options.grant.slice()
    }

    match(pattern) {
        const permissionList = this.getPermissionList().slice()

        return Boolean(
            permissionList.find((permission) => minimatch(permission, pattern))
        )
    }
}

export type PermissionsConfig = {
    grant: Array<string>
}

export class Authorization {
    private neededPermissions: Permission[] = []
    private rules: Rule[] = []
    private onError: Function

    constructor({ onError }: AuthorizationConfig = {}) {
        this.onError = onError || (() => {
            throw new Error('Unauthorized')
        })
    }

    needs(pattern: string): Authorization {
        this.neededPermissions.push({
            pattern,
        })

        return this
    }

    has(pattern: string, condition: () => boolean): Authorization {
        this.rules.push({
            pattern,
            condition,
        })

        return this
    }

    isPermitted(permissions: Permissions): boolean {
        const filteredRules = this.rules.filter(rule => {
            return permissions.match(rule.pattern)
        })

        const rulesAreValid = filteredRules.every((rule) => {
            return rule.condition()
        })

        const neededPermissionsArePresent = this.neededPermissions.every((permission) => {
            return permissions.match(permission.pattern)
        })

        return rulesAreValid
            && neededPermissionsArePresent
    }

    check(permissions: Permissions) {
        if (!this.isPermitted(permissions)) {
            this.onError()
        }
    }
}

export type AuthorizationConfig = {
    onError?: () => void
}

export type Permission = {
    pattern: string
}

export type Rule = {
    pattern: string
    condition: () => boolean
}
