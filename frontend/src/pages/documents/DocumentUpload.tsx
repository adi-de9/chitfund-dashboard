import { useState } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserDocuments,
  uploadDocument,
  deleteDocument,
} from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Trash, Upload, Eye } from "lucide-react";
import { toast } from "sonner";

export default function DocumentUpload() {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const {
    data: documents,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["documents", userId],
    queryFn: () => getUserDocuments(userId!),
    enabled: !!userId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(userId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      toast.success("Document uploaded successfully");
      setUploading(false);
    },
    onError: () => {
      toast.error("Failed to upload document");
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      toast.success("Document deleted successfully");
    },
    onError: () => toast.error("Failed to delete document"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (isError) {
    return <div>Error loading documents</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Document"}
            </label>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents?.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium truncate"
                title={doc.name}
              >
                {doc.name}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4">
                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(doc.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {documents?.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground border rounded-md border-dashed">
            No documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
