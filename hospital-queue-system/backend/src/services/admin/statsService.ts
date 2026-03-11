import { DoctorModel } from '../../models/Doctor.js';
import { QueueItemModel } from '../../models/QueueItem.js';
import { PatientModel } from '../../models/Patient.js';

export async function getStats() {
  const [doctorCount, patientCount] = await Promise.all([
    DoctorModel.countDocuments(),
    PatientModel.countDocuments(),
  ]);

  const queueAgg = await QueueItemModel.aggregate([
    {
      $group: {
        _id: { doctorId: '$doctorId', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const perDoctor: Record<string, { waiting: number; called: number; in_consultation: number; done: number }> = {};

  for (const row of queueAgg) {
    const doctorId = String(row._id.doctorId);
    const status = String(row._id.status) as keyof (typeof perDoctor)[string];
    if (!perDoctor[doctorId]) {
      perDoctor[doctorId] = { waiting: 0, called: 0, in_consultation: 0, done: 0 };
    }
    (perDoctor[doctorId] as any)[status] = row.count;
  }

  const doctors = await DoctorModel.find().lean();

  const doctorsSummary = doctors.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    department: d.department,
    avgConsultTime: d.avgConsultTime,
    queue: perDoctor[d._id.toString()] ?? { waiting: 0, called: 0, in_consultation: 0, done: 0 },
  }));

  const totals = doctorsSummary.reduce(
    (acc, d) => {
      acc.waiting += d.queue.waiting;
      acc.called += d.queue.called;
      acc.in_consultation += d.queue.in_consultation;
      acc.done += d.queue.done;
      return acc;
    },
    { waiting: 0, called: 0, in_consultation: 0, done: 0 },
  );

  return {
    doctorCount,
    patientCount,
    totals,
    doctors: doctorsSummary,
  };
}
