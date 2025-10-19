"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r=>r.json());

export default function ProfilePage() {
  const { data } = useSWR("/api/reputation?limit=10", fetcher);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Address</th>
              <th className="text-left p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {data?.addrs?.map((a: string, i: number) => (
              <tr key={a} className="border-b">
                <td className="p-2">{i+1}</td>
                <td className="p-2">{a}</td>
                <td className="p-2">{data.scores[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

