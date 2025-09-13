import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// definisikan tipe Employee
interface Employee {
  id: string;
  full_name: string;
  job_level: string | null;
  specialization: string | null;
  instagram_url: string | null;
}

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, job_level, specialization, instagram_url');

      if (error) {
        console.error('Error fetching employees:', error.message);
      } else {
        setEmployees(data as Employee[]);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return <p className="text-center py-4">Loading...</p>;
  }

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title mb-6">Daftar Pegawai</h5>

      {employees.length === 0 ? (
        <p className="text-gray-500">Belum ada data pegawai</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {employees.map((emp) => (
            <li key={emp.id} className="py-4 flex items-start gap-3">
              {/* Bullet custom */}
              <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-dark">{emp.full_name}</p>
                  {emp.job_level && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      {emp.job_level}
                    </span>
                  )}
                  {emp.specialization && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {emp.specialization}
                    </span>
                  )}
                </div>
                {emp.instagram_url && (
                  <a
                    href={emp.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm"
                  >
                    {emp.instagram_url}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeList;
