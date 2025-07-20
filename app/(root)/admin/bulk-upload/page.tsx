"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CSV_FORMAT = [
  "aiToolName",
  "aiToolDescription",
  "category",
  "types",
  "websiteUrl",
  "thumbnailImageUrl",
  "pitch",
];

export default function BulkUploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        // Check admin status via API (reuse logic from admin page)
        const res = await fetch("/api/sync-firebase-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          }),
        });
        const data = await res.json();
        setIsAdmin(!!data.isAdmin);
      }
      setChecked(true);
    };
    if (!loading) checkAdmin();
  }, [user, loading]);

  React.useEffect(() => {
    if (checked && !isAdmin) router.replace("/");
  }, [checked, isAdmin, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast({ title: "Invalid file", description: "Please upload a .csv file", variant: "destructive" });
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        // Validate required fields
        const validRows = rows.map((row, idx) => {
          const missing = CSV_FORMAT.filter((key) => !row[key] || row[key].trim() === "");
          return { ...row, _row: idx, _valid: missing.length === 0, _missing: missing };
        });
        setCsvRows(validRows);
        setSelectedRows(validRows.filter((r) => r._valid).map((r) => r._row));
      },
      error: () => {
        toast({ title: "Parse error", description: "Could not parse CSV file", variant: "destructive" });
      },
    });
  };

  const handleSelectRow = (rowIdx: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowIdx) ? prev.filter((i) => i !== rowIdx) : [...prev, rowIdx]
    );
  };

  const handleApproveSelected = async () => {
    if (loading || !user?.email || selectedRows.length === 0) return;
    setLoading(true);
    setResults([]);
    try {
      const selected = csvRows.filter((row) => selectedRows.includes(row._row));
      if (selected.length === 0) {
        toast({ title: "No rows selected", description: "Please select at least one row to upload.", variant: "destructive" });
        setLoading(false);
        return;
      }
      // Get Firebase token for auth
      const idToken = user && (await user.getIdToken());
      const res = await fetch("/api/ai-tools/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ tools: selected, adminEmail: user.email }),
      });
      const data = await res.json();
      setResults(data.results || []);
      if (data.success) {
        toast({ title: "Upload complete", description: `${data.uploaded} uploaded, ${data.skipped} skipped.` });
      } else {
        toast({ title: "Upload error", description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to upload tools", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Set indeterminate state for select-all checkbox
  useEffect(() => {
    if (!selectAllRef.current) return;
    const validRows = csvRows.filter(r => r._valid);
    const allSelected = validRows.length > 0 && validRows.every(r => selectedRows.includes(r._row));
    const someSelected = validRows.some(r => selectedRows.includes(r._row));
    selectAllRef.current.indeterminate = someSelected && !allSelected;
  }, [csvRows, selectedRows]);

  if (loading || !checked) return <div>Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Bulk Upload AI Tools (CSV)</h1>
      <Card className="mb-6 p-4">
        <div className="mb-2 font-semibold">CSV Format:</div>
        <div className="mb-2 text-sm text-gray-700">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">aiToolName, aiToolDescription, category, types, websiteUrl, thumbnailImageUrl, pitch</span>
        </div>
        <div className="mb-2 text-xs text-gray-500">types: comma-separated (e.g. Free,Paid)</div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full mt-2 mb-2"
        />
        <Button onClick={handleApproveSelected} disabled={loading || selectedRows.length === 0} className="mt-2 w-full">
          {loading ? "Uploading..." : "Approve Selected"}
        </Button>
      </Card>
      {csvRows.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="select-all"
              ref={selectAllRef}
              checked={csvRows.filter(r => r._valid).length > 0 && csvRows.filter(r => r._valid).every(r => selectedRows.includes(r._row))}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedRows(csvRows.filter(r => r._valid).map(r => r._row));
                } else {
                  setSelectedRows([]);
                }
              }}
              className="mr-2"
            />
            <label htmlFor="select-all" className="text-sm font-medium">Select All Valid</label>
          </div>
          <table className="min-w-full text-xs sm:text-sm border rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th></th>
                <th>AI Tool Name</th>
                <th>Category</th>
                <th>Types</th>
                <th>Website URL</th>
                <th>Pitch</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {csvRows.map((row, idx) => (
                <tr key={idx} className={row._valid ? "" : "bg-red-50"}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row._row)}
                      disabled={!row._valid}
                      onChange={() => handleSelectRow(row._row)}
                    />
                  </td>
                  <td className="max-w-[120px] truncate" title={row.aiToolName}>{row.aiToolName}</td>
                  <td>{row.category}</td>
                  <td>{row.types}</td>
                  <td className="max-w-[120px] truncate" title={row.websiteUrl}>{row.websiteUrl}</td>
                  <td className="max-w-[120px] truncate" title={row.pitch}>{row.pitch?.slice(0, 30)}{row.pitch?.length > 30 ? "..." : ""}</td>
                  <td>
                    {row._valid ? (
                      <span className="text-green-600">Valid</span>
                    ) : (
                      <span className="text-red-600" title={row._missing?.join(", ")}>Missing: {row._missing?.join(", ")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {results.length > 0 && (
        <Card className="mb-6 p-4">
          <div className="font-semibold mb-2">Upload Results:</div>
          <ul className="text-sm space-y-1">
            {results.map((r, i) => (
              <li key={i} className={r.success ? "text-green-700" : "text-red-700"}>
                {r.aiToolName}: {r.success ? "Uploaded" : `Skipped (${r.reason})`}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
} 