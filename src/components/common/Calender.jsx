    import React from "react";

    const Calendar = ({
        customRange,
        setCustomRange,
        onClose,
        onApply,

    }) => {
        return (
            <div
                className={`absolute top-full right-0  -translate-x-1/2 bg-white shadow-lg rounded-xl p-4 z-50 w-72 border`}
            >
                <h3 className="font-semibold mb-3">Select Date Range</h3>

                {/* Start */}
                <div className="mb-3">
                    <label className="text-xs text-gray-500">Start Date</label>
                    <input
                        type="date"
                        className="border rounded-lg px-3 py-2 w-full"
                        value={customRange.startDate}
                        onChange={(e) =>
                            setCustomRange({ ...customRange, startDate: e.target.value })
                        }
                    />
                </div>

                {/* End */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500">End Date</label>
                    <input
                        type="date"
                        className="border rounded-lg px-3 py-2 w-full"
                        value={customRange.endDate}
                        onChange={(e) =>
                            setCustomRange({ ...customRange, endDate: e.target.value })
                        }
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        className="btn-primary"
                        disabled={!customRange.startDate || !customRange.endDate}
                        onClick={onApply}
                    >
                        Apply
                    </button>
                </div>
            </div>
        );
    };

    export default Calendar;