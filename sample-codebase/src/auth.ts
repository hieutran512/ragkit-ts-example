const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export interface AuthClaims {
    userId: string;
    issuedAt: number;
}

export enum AuthFailureReason {
    MissingHeader = "MissingHeader",
    InvalidScheme = "InvalidScheme",
    InvalidStructure = "InvalidStructure",
    InvalidSignature = "InvalidSignature",
}

export class AuthTokenError extends Error {
    constructor(public readonly reason: AuthFailureReason, message: string) {
        super(message);
    }
}

export class TokenSigner {
    constructor(private readonly secret: string) { }

    sign(userId: string): string {
        const base = `${userId}:${this.secret}`;
        let hash = 0;
        for (let i = 0; i < base.length; i += 1) {
            hash = (hash << 5) - hash + base.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    }

    verify(userId: string, signature: string): boolean {
        return this.sign(userId) === signature;
    }
}

export class AuthService {
    private readonly signer = new TokenSigner(JWT_SECRET);

    validateBearerToken(rawAuthHeader: string | undefined): AuthClaims {
        const token = this.extractBearerToken(rawAuthHeader);
        const [userId, issuedAtRaw, signature] = token.split(".");

        if (!userId || !issuedAtRaw || !signature) {
            throw new AuthTokenError(AuthFailureReason.InvalidStructure, "Invalid token structure");
        }

        if (!this.signer.verify(userId, signature)) {
            throw new AuthTokenError(AuthFailureReason.InvalidSignature, "Invalid token signature");
        }

        return {
            userId,
            issuedAt: Number(issuedAtRaw),
        };
    }

    private extractBearerToken(rawAuthHeader: string | undefined): string {
        if (!rawAuthHeader) {
            throw new AuthTokenError(AuthFailureReason.MissingHeader, "Authorization header is required");
        }

        if (!rawAuthHeader.startsWith("Bearer ")) {
            throw new AuthTokenError(AuthFailureReason.InvalidScheme, "Expected Bearer token scheme");
        }

        return rawAuthHeader.slice("Bearer ".length).trim();
    }
}

export function validateAuthToken(rawAuthHeader: string | undefined): AuthClaims {
    return new AuthService().validateBearerToken(rawAuthHeader);
}
