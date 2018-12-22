// External libraries
import * as moment from 'moment';
import { BigNumber } from 'bignumber.js';

// Utils

export type AmortizationUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years';

/**
 * A list of options for specifying units of duration, in singular and plural forms,
 * ranging from "hours" as the smallest value to "years" as the largest.
 */
export type DurationUnit = 'hour' | 'hours' | 'day' | 'days' | 'week' | 'weeks' | 'month' | 'months' | 'year' | 'years';

enum AmortizationUnitType {
    'hours',
    'days',
    'weeks',
    'months',
    'years',
}

const DURATION_TO_AMORTIZATION_UNIT = {
    hour: 'hours',
    day: 'days',
    week: 'weeks',
    month: 'months',
    year: 'years',
};

/**
 * A wrapper for a duration of time expressed as an amount (e.g. "5") and unit (e.g. "weeks").
 */
export class TimeInterval {
    /**
     * Given an amount (e.g. 1) and a unit of time (e.g. "year"), creates a representation of
     * that duration of time.
     *
     * @example
     * const interval = new TimeInterval(3, "months");
     * => { amount: 3, unit: "months", ... }
     *
     * @param {number} amount
     * @param {DurationUnit} unit
     */
    constructor(readonly amount: number, readonly unit: DurationUnit) {}

    /**
     * Given a UNIX timestamp (e.g. blocktime), returns a UNIX timestamp in seconds
     * that is equal to the time interval beyond that given timestamp.
     *
     * @example
     * // Set up a TimeInterval instance.
     * const interval = new TimeInterval(3, "months");
     * => void
     *
     * // Use the blockchain API to get the current blocktime.
     * const currentBlocktime = await dharma.blockchain.getCurrentBlockTime();
     * => 1528841218
     *
     * // Use the TimeInterval instance to find out what the blocktime will be after the interval.
     * await interval.fromTimestamp(currentBlocktime);
     * => 1536790111
     *
     * @param {BigNumber} timestamp
     * @returns {BigNumber}
     */
    public fromTimestamp(timestamp: BigNumber): BigNumber {
        const currentDate = moment.unix(timestamp.toNumber());

        currentDate.add(this.amount, this.unit);

        const expirationInSeconds = currentDate.unix();

        return new BigNumber(expirationInSeconds);
    }

    public getAmortizationUnit(): AmortizationUnit {
        return DURATION_TO_AMORTIZATION_UNIT[this.unit] || this.unit;
    }

    public getAmortizationUnitType(): AmortizationUnitType {
        return AmortizationUnitType[this.getAmortizationUnit()];
    }
}
