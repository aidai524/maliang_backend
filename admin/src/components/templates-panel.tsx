"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getPromptTemplates,
  createPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  getParamTemplates,
  createParamTemplate,
  updateParamTemplate,
  deleteParamTemplate,
  uploadImage,
  PromptTemplate,
  ParamTemplate,
} from "@/lib/api";

export function TemplatesPanel() {
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [paramTemplates, setParamTemplates] = useState<ParamTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Prompt Template Dialog
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [promptForm, setPromptForm] = useState({
    templateId: "",
    title: "",
    description: "",
    prompt: "",
    category: "",
    thumbnailUrl: "",
    isHot: false,
  });
  const [promptUploading, setPromptUploading] = useState(false);
  const promptFileRef = useRef<HTMLInputElement>(null);

  // Param Template Dialog
  const [paramDialogOpen, setParamDialogOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<ParamTemplate | null>(null);
  const [paramForm, setParamForm] = useState({
    templateId: "",
    title: "",
    description: "",
    thumbnailUrl: "",
    mode: "",
    resolution: "",
    aspectRatio: "",
  });
  const [paramUploading, setParamUploading] = useState(false);
  const paramFileRef = useRef<HTMLInputElement>(null);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{
    type: "prompt" | "param";
    id: string;
  } | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [prompts, params] = await Promise.all([
        getPromptTemplates(),
        getParamTemplates(),
      ]);
      setPromptTemplates(prompts.templates);
      setParamTemplates(params.templates);
    } catch (error) {
      toast.error("加载模板失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // 图片上传处理
  const handleImageUpload = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      setUrl(result.url);
      toast.success('图片上传成功');
    } catch (error) {
      toast.error('图片上传失败');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Prompt Template Handlers
  const openPromptDialog = (template?: PromptTemplate) => {
    if (template) {
      setEditingPrompt(template);
      setPromptForm({
        templateId: template.templateId,
        title: template.title,
        description: template.description || "",
        prompt: template.prompt,
        category: template.category || "",
        thumbnailUrl: template.thumbnailUrl || "",
        isHot: template.isHot,
      });
    } else {
      setEditingPrompt(null);
      setPromptForm({
        templateId: "",
        title: "",
        description: "",
        prompt: "",
        category: "",
        thumbnailUrl: "",
        isHot: false,
      });
    }
    setPromptDialogOpen(true);
  };

  const handleSavePrompt = async () => {
    if (!promptForm.templateId || !promptForm.title || !promptForm.prompt) {
      toast.error('请填写必填字段');
      return;
    }

    try {
      if (editingPrompt) {
        await updatePromptTemplate(editingPrompt.templateId, {
          title: promptForm.title,
          description: promptForm.description || undefined,
          prompt: promptForm.prompt,
          category: promptForm.category || undefined,
          thumbnailUrl: promptForm.thumbnailUrl || undefined,
          isHot: promptForm.isHot,
        });
        toast.success("模板更新成功");
      } else {
        await createPromptTemplate(promptForm);
        toast.success("模板创建成功");
      }
      setPromptDialogOpen(false);
      loadTemplates();
    } catch (error) {
      toast.error("保存模板失败");
      console.error(error);
    }
  };

  // Param Template Handlers
  const openParamDialog = (template?: ParamTemplate) => {
    if (template) {
      setEditingParam(template);
      setParamForm({
        templateId: template.templateId,
        title: template.title,
        description: template.description || "",
        thumbnailUrl: template.thumbnailUrl || "",
        mode: template.mode || "",
        resolution: template.resolution || "",
        aspectRatio: template.aspectRatio || "",
      });
    } else {
      setEditingParam(null);
      setParamForm({
        templateId: "",
        title: "",
        description: "",
        thumbnailUrl: "",
        mode: "",
        resolution: "",
        aspectRatio: "",
      });
    }
    setParamDialogOpen(true);
  };

  const handleSaveParam = async () => {
    if (!paramForm.templateId || !paramForm.title) {
      toast.error('请填写必填字段');
      return;
    }

    try {
      if (editingParam) {
        await updateParamTemplate(editingParam.templateId, {
          title: paramForm.title,
          description: paramForm.description || undefined,
          thumbnailUrl: paramForm.thumbnailUrl || undefined,
          mode: paramForm.mode || undefined,
          resolution: paramForm.resolution || undefined,
          aspectRatio: paramForm.aspectRatio || undefined,
        });
        toast.success("模板更新成功");
      } else {
        await createParamTemplate(paramForm);
        toast.success("模板创建成功");
      }
      setParamDialogOpen(false);
      loadTemplates();
    } catch (error) {
      toast.error("保存模板失败");
      console.error(error);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      if (templateToDelete.type === "prompt") {
        await deletePromptTemplate(templateToDelete.id);
      } else {
        await deleteParamTemplate(templateToDelete.id);
      }
      toast.success("模板删除成功");
      setDeleteDialogOpen(false);
      loadTemplates();
    } catch (error) {
      toast.error("删除模板失败");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>模板管理</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prompts">
          <TabsList>
            <TabsTrigger value="prompts">提示词模板</TabsTrigger>
            <TabsTrigger value="params">参数模板</TabsTrigger>
          </TabsList>

          {/* Prompt Templates */}
          <TabsContent value="prompts" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openPromptDialog()}>添加模板</Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>缩略图</TableHead>
                    <TableHead>模板ID</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>热门</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : promptTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        暂无模板
                      </TableCell>
                    </TableRow>
                  ) : (
                    promptTemplates.map((t) => (
                      <TableRow key={t.templateId}>
                        <TableCell>
                          {t.thumbnailUrl ? (
                            <img
                              src={t.thumbnailUrl}
                              alt={t.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                              无
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {t.templateId}
                        </TableCell>
                        <TableCell>{t.title}</TableCell>
                        <TableCell>{t.category || "-"}</TableCell>
                        <TableCell>
                          {t.isHot && <Badge variant="secondary">热门</Badge>}
                        </TableCell>
                        <TableCell>{t.usageCount}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPromptDialog(t)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setTemplateToDelete({
                                type: "prompt",
                                id: t.templateId,
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Param Templates */}
          <TabsContent value="params" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openParamDialog()}>添加模板</Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>缩略图</TableHead>
                    <TableHead>模板ID</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>模式</TableHead>
                    <TableHead>分辨率</TableHead>
                    <TableHead>宽高比</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : paramTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        暂无模板
                      </TableCell>
                    </TableRow>
                  ) : (
                    paramTemplates.map((t) => (
                      <TableRow key={t.templateId}>
                        <TableCell>
                          {t.thumbnailUrl ? (
                            <img
                              src={t.thumbnailUrl}
                              alt={t.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                              无
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {t.templateId}
                        </TableCell>
                        <TableCell>{t.title}</TableCell>
                        <TableCell>{t.mode || "-"}</TableCell>
                        <TableCell>{t.resolution || "-"}</TableCell>
                        <TableCell>{t.aspectRatio || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openParamDialog(t)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setTemplateToDelete({
                                type: "param",
                                id: t.templateId,
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Prompt Template Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? "编辑提示词模板" : "创建提示词模板"}
            </DialogTitle>
            <DialogDescription>
              配置提示词模板的详细信息
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>模板ID <span className="text-red-500">*</span></Label>
                <Input
                  value={promptForm.templateId}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, templateId: e.target.value })
                  }
                  disabled={!!editingPrompt}
                  placeholder="唯一标识，如 sunset-001"
                />
              </div>
              <div className="space-y-2">
                <Label>标题 <span className="text-red-500">*</span></Label>
                <Input
                  value={promptForm.title}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, title: e.target.value })
                  }
                  placeholder="模板名称"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={promptForm.description}
                onChange={(e) =>
                  setPromptForm({ ...promptForm, description: e.target.value })
                }
                placeholder="简短描述"
              />
            </div>

            <div className="space-y-2">
              <Label>提示词内容 <span className="text-red-500">*</span></Label>
              <Textarea
                value={promptForm.prompt}
                onChange={(e) =>
                  setPromptForm({ ...promptForm, prompt: e.target.value })
                }
                placeholder="实际的提示词文本..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>分类</Label>
                <Input
                  value={promptForm.category}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, category: e.target.value })
                  }
                  placeholder="如：动物、风景"
                />
              </div>
              <div className="space-y-2">
                <Label>缩略图</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={promptFileRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(
                          file,
                          (url) => setPromptForm({ ...promptForm, thumbnailUrl: url }),
                          setPromptUploading
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => promptFileRef.current?.click()}
                    disabled={promptUploading}
                    className="flex-1"
                  >
                    {promptUploading ? "上传中..." : "选择图片"}
                  </Button>
                  {promptForm.thumbnailUrl && (
                    <img
                      src={promptForm.thumbnailUrl}
                      alt="预览"
                      className="w-10 h-10 object-cover rounded border"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isHot"
                checked={promptForm.isHot}
                onChange={(e) =>
                  setPromptForm({ ...promptForm, isHot: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isHot">标记为热门</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPromptDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSavePrompt}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Param Template Dialog */}
      <Dialog open={paramDialogOpen} onOpenChange={setParamDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParam ? "编辑参数模板" : "创建参数模板"}
            </DialogTitle>
            <DialogDescription>
              配置参数模板的详细信息
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>模板ID <span className="text-red-500">*</span></Label>
                <Input
                  value={paramForm.templateId}
                  onChange={(e) =>
                    setParamForm({ ...paramForm, templateId: e.target.value })
                  }
                  disabled={!!editingParam}
                  placeholder="唯一标识"
                />
              </div>
              <div className="space-y-2">
                <Label>标题 <span className="text-red-500">*</span></Label>
                <Input
                  value={paramForm.title}
                  onChange={(e) =>
                    setParamForm({ ...paramForm, title: e.target.value })
                  }
                  placeholder="模板名称"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={paramForm.description}
                onChange={(e) =>
                  setParamForm({ ...paramForm, description: e.target.value })
                }
                placeholder="简短描述"
              />
            </div>

            <div className="space-y-2">
              <Label>缩略图</Label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={paramFileRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(
                        file,
                        (url) => setParamForm({ ...paramForm, thumbnailUrl: url }),
                        setParamUploading
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => paramFileRef.current?.click()}
                  disabled={paramUploading}
                  className="flex-1"
                >
                  {paramUploading ? "上传中..." : "选择图片"}
                </Button>
                {paramForm.thumbnailUrl && (
                  <img
                    src={paramForm.thumbnailUrl}
                    alt="预览"
                    className="w-10 h-10 object-cover rounded border"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>模式</Label>
                <Input
                  value={paramForm.mode}
                  onChange={(e) =>
                    setParamForm({ ...paramForm, mode: e.target.value })
                  }
                  placeholder="draft / final"
                />
              </div>
              <div className="space-y-2">
                <Label>分辨率</Label>
                <Input
                  value={paramForm.resolution}
                  onChange={(e) =>
                    setParamForm({ ...paramForm, resolution: e.target.value })
                  }
                  placeholder="1K / 2K / 4K"
                />
              </div>
              <div className="space-y-2">
                <Label>宽高比</Label>
                <Input
                  value={paramForm.aspectRatio}
                  onChange={(e) =>
                    setParamForm({ ...paramForm, aspectRatio: e.target.value })
                  }
                  placeholder="16:9"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setParamDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveParam}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除模板</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此模板吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
