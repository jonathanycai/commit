import jwt from "jsonwebtoken";

const getAccessSecret = () =>
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

const getRefreshSecret = () =>
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

const assertSecrets = () => {
    if (!getAccessSecret() || !getRefreshSecret()) {
        throw new Error(
            "Missing JWT secrets. Set JWT_SECRET (or ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET)."
        );
    }
};

export const signAccessToken = (user, expiresIn = "20m") => {
    assertSecrets();
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            type: "access",
        },
        getAccessSecret(),
        { expiresIn }
    );
};

export const signRefreshToken = (user, expiresIn = "14d") => {
    assertSecrets();
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            type: "refresh",
        },
        getRefreshSecret(),
        { expiresIn }
    );
};

export const verifyAccessToken = (token) => {
    assertSecrets();
    const payload = jwt.verify(token, getAccessSecret());
    if (payload?.type !== "access") {
        throw new Error("Invalid token type");
    }
    return payload;
};

export const verifyRefreshToken = (token) => {
    assertSecrets();
    const payload = jwt.verify(token, getRefreshSecret());
    if (payload?.type !== "refresh") {
        throw new Error("Invalid token type");
    }
    return payload;
};
