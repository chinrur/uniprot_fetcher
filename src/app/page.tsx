"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUniProtData, UniProtData, getUniProtSequence } from "@/services/uniprot";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [accessionId, setAccessionId] = useState("");
  const [uniProtData, setUniProtData] = useState<UniProtData | null>(null);
  const [sequence, setSequence] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const headers = [
    { label: "Accession", key: "accession" },
    { label: "Gene Name", key: "geneName" },
    { label: "Protein Name", key: "proteinName" },
    { label: "Species", key: "species" },
    { label: "Sequence", key: "sequence" },
  ];

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const data = await getUniProtData(accessionId);
      setUniProtData(data);

      // Fetch sequence data
      const sequenceData = await getUniProtSequence(accessionId);
      setSequence(sequenceData);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch UniProt data. Please check the accession ID and try again.",
      });
      setUniProtData(null);
      setSequence(null);
    } finally {
      setLoading(false);
    }
  };

  const csvData = uniProtData ? [{ ...uniProtData, sequence: sequence || '' }] : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-500">UniProt Data Fetcher</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          type="text"
          placeholder="Enter UniProt Accession ID"
          value={accessionId}
          onChange={(e) => setAccessionId(e.target.value)}
        />
        <Button onClick={handleFetchData} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Data"}
        </Button>
      </div>

      {uniProtData ? (
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableCaption>UniProt data for accession ID: {accessionId}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Accession</TableHead>
                <TableHead>Gene Name</TableHead>
                <TableHead>Protein Name</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Sequence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{uniProtData.accession}</TableCell>
                <TableCell>{uniProtData.geneName}</TableCell>
                <TableCell>{uniProtData.proteinName}</TableCell>
                <TableCell>{uniProtData.species}</TableCell>
                <TableCell>
                  <Textarea
                    readOnly
                    value={sequence || 'N/A'}
                    className="w-full min-h-[50px] font-mono text-xs"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="w-[200px] h-[20px]" />
          <Skeleton className="w-[200px] h-[20px]" />
          <Skeleton className="w-[200px] h-[20px]" />
          <Skeleton className="w-[200px] h-[20px]" />
        </div>
      ) : (
        <p>No data fetched yet. Please enter an accession ID and click Fetch Data.</p>
      )}

      {uniProtData && (
        <div className="mt-4">
          <CSVLink data={csvData} headers={headers} filename={"uniprot_data.csv"}>
            <Button variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </CSVLink>
        </div>
      )}
    </div>
  );
}
