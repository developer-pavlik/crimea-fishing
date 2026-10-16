const THOUSANDS_SEPARATOR = " ";

/**
 * Formats a numeric price with a non-breaking space between thousands.
 */
export function formatPrice(value: number): string {
    if (!Number.isFinite(value)) {
        throw new RangeError("Цена должна быть конечным числом.");
    }

    const [integerPart, fractionPart] = Math.abs(value).toString().split(".");
    const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        THOUSANDS_SEPARATOR,
    );
    const sign = value < 0 ? "-" : "";

    return `${sign}${formattedInteger}${fractionPart ? `.${fractionPart}` : ""}`;
}
