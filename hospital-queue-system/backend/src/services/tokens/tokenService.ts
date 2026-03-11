import { CounterModel } from '../../models/Counter.js';

export async function nextTokenForDepartment(departmentCode: string): Promise<string> {
  const key = `token:${departmentCode}`;

  const counter = await CounterModel.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `${departmentCode}${counter.seq}`;
}
