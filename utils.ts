export function sendError(res, e) {
    const { message } = e;
    res.json({
        error: true,
        message,
    });
}