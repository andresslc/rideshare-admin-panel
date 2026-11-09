import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Plus, RefreshCcw, Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import usePeakWindowsActions from "../hooks/ride-rates/usePeakWindowsActions";
import { handleError } from "../utils/helpers";

const getWindowRange = (window) => ({
  startHour: Number(window.startHour),
  endHour: Number(window.endHour),
});

const overlaps = (a, b) => Math.max(a.startHour, b.startHour) < Math.min(a.endHour, b.endHour);

const peakWindowSchema = z
  .object({
    startHour: z.coerce.number().int().min(0).max(23),
    endHour: z.coerce.number().int().min(1).max(24),
    isActive: z.coerce.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.endHour <= value.startHour) {
      ctx.addIssue({
        code: "custom",
        path: ["endHour"],
        message: "End hour must be greater than start hour",
      });
    }
  });

const emptyWindow = {
  startHour: 7,
  endHour: 10,
  isActive: true,
};

const PeakWindows = () => {
  const { loading, peakWindows, createPeakWindow, updatePeakWindow, deletePeakWindow } =
    usePeakWindowsActions();
  const [editingWindow, setEditingWindow] = useState(null);
  const editingWindowId = editingWindow?.id || editingWindow?._id || null;

  const defaultValues = useMemo(() => editingWindow || emptyWindow, [editingWindow]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(peakWindowSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (values) => {
    const nextRange = getWindowRange(values);
    const hasConflict = peakWindows.some((window) => {
      const windowId = window.id || window._id;
      if (editingWindowId && windowId === editingWindowId) return false;
      return overlaps(nextRange, getWindowRange(window));
    });

    if (hasConflict) {
      handleError(new Error("This time range overlaps an existing peak window"));
      return;
    }

    if (editingWindow?.id || editingWindow?._id) {
      await updatePeakWindow(editingWindow.id || editingWindow._id, values);
    } else {
      await createPeakWindow(values);
    }
    setEditingWindow(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-gray-900 p-6 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Timing</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Peak Windows</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-300">
              Define the hours when pricing surcharges should apply. Add, edit, or disable windows from this page.
            </p>
          </div>
          <Button onClick={() => setEditingWindow({ ...emptyWindow })} icon={<Plus className="h-4 w-4" />}>
            Add Window
          </Button>
        </div>
      </div>

      {loading && !peakWindows.length ? (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          Loading peak windows...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {peakWindows.map((window) => (
            <Card key={window.id || window._id} className="border border-gray-200 shadow-sm dark:border-gray-800">
              <Card.Content>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {window.startHour}:00 - {window.endHour}:00
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {window.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWindow(window)}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deletePeakWindow(window.id || window._id)}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-400">Start hour</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {window.startHour}:00
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-400">End hour</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {window.endHour}:00
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-400">State</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {window.isActive ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!editingWindow}
        onClose={() => setEditingWindow(null)}
        title={editingWindow?.id || editingWindow?._id ? "Edit Peak Window" : "Create Peak Window"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Start hour" type="number" min="0" max="23" {...register("startHour")} error={errors.startHour?.message} />
            <Input label="End hour" type="number" min="1" max="24" {...register("endHour")} error={errors.endHour?.message} />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-gray-300 px-4 py-3 dark:border-gray-700">
            <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditingWindow(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Window
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PeakWindows;
