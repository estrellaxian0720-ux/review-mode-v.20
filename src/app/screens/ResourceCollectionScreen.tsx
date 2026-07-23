import { ChevronLeft, FileUp, Link2, FileText, X, ExternalLink, Lightbulb, File, Youtube, Link as LinkIcon, Check, Folder, ChevronRight, FolderOpen, ArrowLeft, Presentation, FileImage, Plus, AlertCircle, RefreshCw, Loader2, XCircle, CheckCircle, Bug, Image, AlertTriangle } from 'lucide-react';
import { useState, useRef } from 'react';
import { TopNavigation } from '../components/TopNavigation';
import { SetupStepIndicator } from '../components/SetupStepIndicator';

interface ResourceCollectionScreenProps {
  onNext?: () => void;
  onNavigateHome?: () => void;
  onBack?: () => void;
}

type SourceTab = 'internal' | 'external';
type UploadMethod = 'files' | 'link' | 'text' | 'images';
type FileCategory = 'ppt' | 'pdf' | 'word' | 'markdown' | 'image-pdf';

interface UploadedFile {
  id: string;
  name: string;
  category: FileCategory;
  size: string;
}

type UploadStatus = 'uploading' | 'success' | 'failed';

type LinkErrorType =
  | 'invalid-url'
  | 'login-required'
  | 'paywall'
  | 'access-denied'
  | 'captcha'
  | 'unsupported';

interface AddedResource {
  id: string;
  name: string;
  type: 'internal' | 'external';
  category?: FileCategory;
  size?: string;
  preview?: string;
  uploadStatus?: UploadStatus;
  errorMessage?: string;
}

// Detect if text content looks like Markdown
function detectMarkdown(text: string): boolean {
  const mdPatterns = [
    /^#{1,6}\s+.+/m,       // headings
    /\*\*.+\*\*/,           // bold
    /^\s*[-*+]\s+/m,        // unordered list
    /^\s*\d+\.\s+/m,        // ordered list
    /```[\s\S]*?```/,        // code block
    /\[.+\]\(.+\)/,         // links
    /^\s*>\s+/m,             // blockquote
    /^\s*\|.+\|/m,          // table
  ];
  return mdPatterns.filter(p => p.test(text)).length >= 2;
}

function validateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Mock link error simulation
function simulateLinkError(url: string): LinkErrorType | null {
  // For demo: deterministically assign errors based on URL content
  if (url.includes('login') || url.includes('signin')) return 'login-required';
  if (url.includes('premium') || url.includes('paid') || url.includes('subscribe')) return 'paywall';
  if (url.includes('private') || url.includes('internal')) return 'access-denied';
  if (url.includes('captcha') || url.includes('verify')) return 'captcha';
  if (url.includes('audio') || url.includes('podcast') || url.includes('spotify')) return 'unsupported';
  // Random for others: 30% chance of error
  const roll = Math.random();
  if (roll < 0.05) return 'login-required';
  if (roll < 0.10) return 'paywall';
  if (roll < 0.13) return 'access-denied';
  if (roll < 0.15) return 'captcha';
  if (roll < 0.18) return 'unsupported';
  return null;
}

function getLinkErrorMessage(type: LinkErrorType): string {
  switch (type) {
    case 'invalid-url': return '链接格式不正确。';
    case 'login-required': return '读取失败，该内容需要登录后访问。';
    case 'paywall': return '读取失败，该内容需要会员或付费权限。';
    case 'access-denied': return '读取失败，该内容需要访问权限。';
    case 'captcha': return '读取失败，该内容需要完成验证后访问。';
    case 'unsupported': return '暂不支持该链接。';
  }
}

// Mock images for the image manager
const MOCK_IMAGES = Array.from({ length: 18 }, (_, i) => ({
  id: `img-${i + 1}`,
  name: `Image ${i + 1}.jpg`,
  thumb: `https://picsum.photos/seed/${i + 10}/120/90`,
}));

export function ResourceCollectionScreen({ onNext, onNavigateHome, onBack }: ResourceCollectionScreenProps) {
  const [activeTopTab, setActiveTopTab] = useState('review');
  const [sourceTab, setSourceTab] = useState<SourceTab>('internal');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('files');

  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Text paste state
  const [pastedText, setPastedText] = useState('');
  const [showMarkdownConfirm, setShowMarkdownConfirm] = useState(false);
  const [pendingTextAsMarkdown, setPendingTextAsMarkdown] = useState(false);

  // Image manager state
  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [imageCounter, setImageCounter] = useState(1);

  // Internal Notes folder state
  const [selectedFolderId, setSelectedFolderId] = useState<string>('unarchived');
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);

  const [addedResources, setAddedResources] = useState<AddedResource[]>([]);

  const MAX_RESOURCES = 5;
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showUploadResultFeedback, setShowUploadResultFeedback] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const [folders] = useState([
    { id: 'unarchived', name: 'Unarchived', parentId: 'root', isSystem: true, noteCount: 5 },
    { id: 'folder-1', name: 'Linear Algebra', parentId: 'root', isSystem: false, noteCount: 2 },
    { id: 'folder-2', name: 'Calculus', parentId: 'root', isSystem: false, noteCount: 6 },
    { id: 'folder-1-1', name: 'Matrices', parentId: 'folder-1', isSystem: false, noteCount: 4 },
    { id: 'folder-1-2', name: 'Vector Spaces', parentId: 'folder-1', isSystem: false, noteCount: 3 },
  ]);

  const [notes] = useState([
    { id: 'note-1', title: 'Eigenvalues Definition', folderId: 'unarchived', preview: 'Key characteristics and properties...' },
    { id: 'note-2', title: 'Matrix Operations', folderId: 'unarchived', preview: 'Basic operations on matrices...' },
    { id: 'note-3', title: 'Linear Independence', folderId: 'unarchived', preview: 'Understanding linear independence...' },
    { id: 'note-4', title: 'Basis and Dimension', folderId: 'unarchived', preview: 'Fundamental concepts...' },
    { id: 'note-5', title: 'Inner Product Spaces', folderId: 'unarchived', preview: 'Properties of inner products...' },
    { id: 'note-6', title: 'Determinants', folderId: 'folder-1', preview: 'Computing determinants...' },
    { id: 'note-7', title: 'Rank-Nullity Theorem', folderId: 'folder-1', preview: 'Important theorem...' },
    { id: 'note-8', title: 'Matrix Multiplication', folderId: 'folder-1-1', preview: 'Rules and properties...' },
    { id: 'note-9', title: 'Inverse Matrices', folderId: 'folder-1-1', preview: 'Finding inverses...' },
    { id: 'note-10', title: 'Orthogonal Vectors', folderId: 'folder-1-2', preview: 'Orthogonality concepts...' },
  ]);

  const getCurrentFolders = () => {
    const currentFolderId = currentPath[currentPath.length - 1];
    return folders.filter(f => f.parentId === currentFolderId);
  };

  const getNotesInFolder = (folderId: string) => notes.filter(n => n.folderId === folderId);

  const isResourceAdded = (id: string) => addedResources.some(r => r.id === id);

  const handleAddNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note && !isResourceAdded(noteId) && addedResources.length < MAX_RESOURCES) {
      setAddedResources([...addedResources, {
        id: noteId,
        name: note.title,
        type: 'internal',
        preview: note.preview,
        uploadStatus: 'success',
      }]);
    } else if (addedResources.length >= MAX_RESOURCES) {
      setShowLimitWarning(true);
    }
  };

  const handleAddExternalFile = (file: UploadedFile) => {
    if (!isResourceAdded(file.id) && addedResources.length < MAX_RESOURCES) {
      const newResource: AddedResource = {
        id: file.id,
        name: file.name,
        type: 'external',
        category: file.category,
        size: file.size,
        uploadStatus: 'uploading',
      };
      setAddedResources(prev => [...prev, newResource]);

      setTimeout(() => {
        const isSuccess = Math.random() > 0.3;
        setAddedResources(prev => prev.map(r =>
          r.id === file.id
            ? { ...r, uploadStatus: isSuccess ? 'success' : 'failed', errorMessage: isSuccess ? undefined : 'Upload failed. Network error or file is corrupted.' }
            : r
        ));
        setTimeout(() => {
          setAddedResources(current => {
            if (current.filter(r => r.uploadStatus === 'failed').length > 0) {
              setShowUploadResultFeedback(true);
            }
            return current;
          });
        }, 500);
      }, 1500);
    } else if (addedResources.length >= MAX_RESOURCES) {
      setShowLimitWarning(true);
    }
  };

  const handleRetryUpload = (resourceId: string, keepModalOpen = false) => {
    setAddedResources(prev => prev.map(r =>
      r.id === resourceId ? { ...r, uploadStatus: 'uploading', errorMessage: undefined } : r
    ));
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      setAddedResources(prev => prev.map(r =>
        r.id === resourceId
          ? { ...r, uploadStatus: isSuccess ? 'success' : 'failed', errorMessage: isSuccess ? undefined : 'Upload failed. Network error or file is corrupted.' }
          : r
      ));
      if (!keepModalOpen) {
        setTimeout(() => {
          setAddedResources(current => {
            if (current.filter(r => r.uploadStatus === 'failed').length === 0 && showUploadResultFeedback) {
              setShowUploadResultFeedback(false);
            }
            return current;
          });
        }, 500);
      }
    }, 1500);
  };

  const handleRetryAllFailedUploads = () => {
    addedResources.filter(r => r.uploadStatus === 'failed').forEach(f => handleRetryUpload(f.id, true));
  };

  const handleRemoveResource = (id: string) => {
    setAddedResources(addedResources.filter(r => r.id !== id));
  };

  // Link import
  const handleImportLink = async () => {
    if (!linkUrl.trim()) return;
    if (!validateUrl(linkUrl.trim())) {
      setLinkError(getLinkErrorMessage('invalid-url'));
      return;
    }
    setLinkError(null);
    setLinkSuccess(false);
    setLinkLoading(true);

    await new Promise(r => setTimeout(r, 1200));

    const errorType = simulateLinkError(linkUrl);
    setLinkLoading(false);

    if (errorType) {
      setLinkError(getLinkErrorMessage(errorType));
      return;
    }

    setLinkSuccess(true);
    const isYoutube = linkUrl.includes('youtube') || linkUrl.includes('youtu.be');
    const newFile: UploadedFile = {
      id: `ext-${Date.now()}`,
      name: isYoutube ? 'YouTube Video' : 'Web Article',
      category: 'pdf',
      size: 'Link',
    };
    handleAddExternalFile(newFile);
    setTimeout(() => {
      setLinkUrl('');
      setLinkSuccess(false);
      setShowUploadPopup(false);
    }, 600);
  };

  // Text paste — detect markdown
  const handleImportText = () => {
    if (!pastedText.trim()) return;
    if (detectMarkdown(pastedText)) {
      setShowMarkdownConfirm(true);
    } else {
      commitTextImport(false);
    }
  };

  const commitTextImport = (asMarkdown: boolean) => {
    const newFile: UploadedFile = {
      id: `ext-${Date.now()}`,
      name: asMarkdown ? 'Markdown Content' : 'Pasted Text Content',
      category: asMarkdown ? 'markdown' : 'pdf',
      size: `${Math.ceil(pastedText.length / 1024)} KB`,
    };
    handleAddExternalFile(newFile);
    setPastedText('');
    setShowMarkdownConfirm(false);
    setShowUploadPopup(false);
  };

  // Image manager
  const toggleImageSelection = (id: string) => {
    if (selectedImageIds.includes(id)) {
      setSelectedImageIds(prev => prev.filter(i => i !== id));
    } else if (selectedImageIds.length < 10) {
      setSelectedImageIds(prev => [...prev, id]);
    }
  };

  const handleConfirmImages = () => {
    if (selectedImageIds.length === 0) return;
    if (addedResources.length >= MAX_RESOURCES) {
      setShowLimitWarning(true);
      setShowImageManager(false);
      return;
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const seq = String(imageCounter).padStart(3, '0');
    const newFile: UploadedFile = {
      id: `img-pdf-${Date.now()}`,
      name: `图片_${dateStr}_${seq}.pdf`,
      category: 'image-pdf',
      size: `${selectedImageIds.length} images`,
    };
    handleAddExternalFile(newFile);
    setImageCounter(c => c + 1);
    setSelectedImageIds([]);
    setShowImageManager(false);
    setShowUploadPopup(false);
  };

  const handleFileSelect = (category: FileCategory) => {
    if (category === 'image-pdf') {
      setShowImageManager(true);
      return;
    }
    const ext = category === 'ppt' ? 'pptx' : category === 'word' ? 'docx' : category === 'markdown' ? 'md' : 'pdf';
    const newFile: UploadedFile = {
      id: `ext-${Date.now()}`,
      name: `Sample_file.${ext}`,
      category,
      size: '2.4 MB',
    };
    handleAddExternalFile(newFile);
    setShowUploadPopup(false);
  };

  const getCategoryIcon = (category?: FileCategory) => {
    switch (category) {
      case 'ppt': return <Presentation className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'word': return <FileText className="w-4 h-4" />;
      case 'markdown': return <FileText className="w-4 h-4" />;
      case 'image-pdf': return <FileImage className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: FileCategory) => {
    switch (category) {
      case 'ppt': return 'bg-orange-100 text-orange-600';
      case 'pdf': return 'bg-red-100 text-red-600';
      case 'word': return 'bg-blue-100 text-blue-600';
      case 'markdown': return 'bg-teal-100 text-teal-600';
      case 'image-pdf': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] relative">
      <TopNavigation
        activeTab={activeTopTab}
        onHomeClick={() => { setActiveTopTab('home'); onNavigateHome?.(); }}
        onReviewClick={() => setActiveTopTab('review')}
        onPracticeClick={() => setActiveTopTab('practice')}
      />

      <div className="flex-1 overflow-auto pb-4">
        <div className="max-w-[860px] mx-auto px-8 py-6">
          {/* Header row: title left, stepper right */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[24px] font-bold text-[#111827] leading-tight font-['Inter']">Add Materials</h1>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5 font-['Inter']">Step 2 of 3</p>
              <p className="text-[12px] text-[#6B7280] mt-1 font-['Inter']">Upload all resources you'll use for this exam. You'll prioritize them in the next step.</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <SetupStepIndicator currentStep={2} />
              <button onClick={() => setShowDebugPanel(!showDebugPanel)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors ml-3">
                <Bug className={`w-4 h-4 ${showDebugPanel ? 'text-orange-500' : 'text-gray-300'}`} />
              </button>
            </div>
          </div>

          {showDebugPanel && (
            <div className="bg-gray-900 text-white rounded-2xl p-6 mb-5 border-2 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-orange-500" />
                  <h4 className="text-lg font-bold">Debug Panel</h4>
                </div>
                <button onClick={() => setShowDebugPanel(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setAddedResources(prev => [...prev, { id: `d-s-${Date.now()}`, name: 'Debug Success.pdf', type: 'external', category: 'pdf', size: '2.4 MB', uploadStatus: 'success' }]); }} className="px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Add Success</button>
                <button onClick={() => { const r = { id: `d-f-${Date.now()}`, name: 'Debug Failed.pdf', type: 'external' as const, category: 'pdf' as FileCategory, size: '2.4 MB', uploadStatus: 'failed' as UploadStatus, errorMessage: 'Upload failed.' }; setAddedResources(prev => [...prev, r]); setTimeout(() => setShowUploadResultFeedback(true), 500); }} className="px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium flex items-center gap-2"><XCircle className="w-4 h-4" /> Add Failed</button>
                <button onClick={() => setAddedResources([])} className="col-span-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-2"><X className="w-4 h-4" /> Clear All</button>
              </div>
              <p className="text-xs text-gray-400 mt-4">Resources: {addedResources.length}/{MAX_RESOURCES}</p>
            </div>
          )}

          {/* Source Tabs */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setSourceTab('internal')} className={`flex-1 px-5 py-3 text-[14px] font-bold transition-all rounded-xl ${sourceTab === 'internal' ? 'bg-white border-2 border-[#2D8CFF] text-[#1F2937] shadow-sm' : 'bg-white border-2 border-gray-200 text-[#6B7280] hover:border-gray-300'}`}>
              <Lightbulb className="w-4 h-4 inline-block mr-2" />Internal Notes
            </button>
            <button onClick={() => setSourceTab('external')} className={`flex-1 px-5 py-3 text-[14px] font-bold transition-all rounded-xl ${sourceTab === 'external' ? 'bg-white border-2 border-[#2D8CFF] text-[#1F2937] shadow-sm' : 'bg-white border-2 border-gray-200 text-[#6B7280] hover:border-gray-300'}`}>
              <ExternalLink className="w-4 h-4 inline-block mr-2" />External Sources (Upload)
            </button>
          </div>

          {showLimitWarning && (
            <div className="bg-[#FFFBEB] border-[1.5px] border-[#FEE685] rounded-[14px] p-4 mb-5 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-[#FE9A00] flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-[16px] font-semibold text-[#7B3306] mb-1">Beta Limit Reached</h4>
                <p className="text-[14px] text-[#973C00] mb-1">Each study space in beta supports up to 5 materials.</p>
                <p className="text-[12px] text-[#7B3306] opacity-80">Keep only the most important resources for the best results.</p>
              </div>
              <button onClick={() => setShowLimitWarning(false)} className="p-1 text-[#7B3306] hover:text-[#973C00]"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Internal Sources Tab */}
          {sourceTab === 'internal' && (
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden mb-5">
              <div className="flex h-[400px]">
                <div className="w-[280px] border-r-2 border-gray-200 flex flex-col">
                  <div className="px-4 py-3 border-b-2 border-gray-200 bg-[#F9FAFB]">
                    <h3 className="text-[13px] font-bold text-[#111827]">FOLDERS</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {getCurrentFolders().map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => {
                          if (folder.id === selectedFolderId) {
                            const hasSubfolders = folders.some(f => f.parentId === folder.id);
                            if (hasSubfolders && !folder.isSystem) setCurrentPath([...currentPath, folder.id]);
                          } else {
                            setSelectedFolderId(folder.id);
                          }
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group ${selectedFolderId === folder.id ? 'bg-[#EFF6FF] border-l-4 border-l-[#2D8CFF]' : 'border-l-4 border-l-transparent'}`}
                      >
                        <div className={`flex-shrink-0 ${selectedFolderId === folder.id ? 'text-[#2D8CFF]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]'}`}>
                          {folder.isSystem ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-[13px] font-semibold truncate ${selectedFolderId === folder.id ? 'text-[#2D8CFF]' : 'text-[#374151]'}`}>{folder.name}</p>
                            <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{getNotesInFolder(folder.id).length}</span>
                          </div>
                        </div>
                        {folders.some(f => f.parentId === folder.id) && !folder.isSystem && (
                          <ChevronRight className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  {currentPath.length > 1 && (
                    <div className="px-4 py-3 border-t-2 border-gray-200">
                      <button
                        onClick={() => {
                          const newPath = currentPath.slice(0, -1);
                          setCurrentPath(newPath);
                          const foldersAtLevel = folders.filter(f => f.parentId === newPath[newPath.length - 1]);
                          if (foldersAtLevel.length > 0) setSelectedFolderId(foldersAtLevel[0].id);
                        }}
                        className="flex items-center gap-2 text-[13px] font-semibold text-[#6B7280] hover:text-[#1F2937] transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />Back
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="px-5 py-3 border-b-2 border-gray-200 bg-[#F9FAFB]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-[#111827]">Notes in {folders.find(f => f.id === selectedFolderId)?.name || 'Folder'}</h3>
                      <span className="text-[11px] text-[#6B7280]">{getNotesInFolder(selectedFolderId).length} notes</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {getNotesInFolder(selectedFolderId).length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-[13px] text-[#6B7280]">No notes in this folder</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getNotesInFolder(selectedFolderId).map((note) => {
                          const isAdded = isResourceAdded(note.id);
                          return (
                            <div key={note.id} className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white transition-all">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-shrink-0 mt-0.5"><FileText className="w-5 h-5 text-[#6B7280]" /></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-[#111827] mb-1">{note.title}</p>
                                  <p className="text-[11px] text-[#6B7280] line-clamp-1">{note.preview}</p>
                                </div>
                                {isAdded ? (
                                  <div className="flex items-center gap-1.5 text-[#008236] flex-shrink-0">
                                    <Check className="w-4 h-4" /><span className="text-[12px] font-medium">Added</span>
                                  </div>
                                ) : (
                                  <button onClick={() => handleAddNote(note.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                                    <Plus className="w-4 h-4" /><span className="text-[12px] font-medium">Add</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* External Sources Tab */}
          {sourceTab === 'external' && (
            <div className="grid grid-cols-4 gap-4 mb-5">
              {/* Import Files */}
              <button
                onClick={() => { setUploadMethod('files'); setShowUploadPopup(true); }}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#EFF6FF] text-[#2D8CFF] flex items-center justify-center group-hover:bg-[#2D8CFF] group-hover:text-white transition-all">
                  <FileUp className="w-6 h-6" />
                </div>
                <h3 className="text-[13px] font-bold text-[#111827] mb-1">Import Files</h3>
                <p className="text-[11px] text-[#6B7280]">From your device</p>
              </button>

              {/* Paste Link */}
              <button
                onClick={() => { setUploadMethod('link'); setLinkUrl(''); setLinkError(null); setLinkSuccess(false); setShowUploadPopup(true); }}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center group-hover:bg-[#F59E0B] group-hover:text-white transition-all">
                  <Link2 className="w-6 h-6" />
                </div>
                <h3 className="text-[13px] font-bold text-[#111827] mb-1">Paste Link</h3>
                <p className="text-[11px] text-[#6B7280]">Web URL or YouTube</p>
              </button>

              {/* Paste Text */}
              <button
                onClick={() => { setUploadMethod('text'); setShowUploadPopup(true); }}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#F3E8FF] text-[#A855F7] flex items-center justify-center group-hover:bg-[#A855F7] group-hover:text-white transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-[13px] font-bold text-[#111827] mb-1">Paste Text</h3>
                <p className="text-[11px] text-[#6B7280]">Notes or content</p>
              </button>

              {/* Import Images */}
              <button
                onClick={() => { setUploadMethod('images'); setSelectedImageIds([]); setShowImageManager(true); }}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-all">
                  <Image className="w-6 h-6" />
                </div>
                <h3 className="text-[13px] font-bold text-[#111827] mb-1">Add Images</h3>
                <p className="text-[11px] text-[#6B7280]">Up to 10, as PDF</p>
              </button>
            </div>
          )}

          {/* Selected Resources List */}
          {addedResources.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-5 mb-5">
              <div className="mb-4">
                <h3 className="text-[18px] font-bold text-[#111827] mb-1">Selected Resources ({addedResources.length})</h3>
                <p className="text-[12px] text-[#6B7280]">These materials will be analyzed and prioritized in the next step</p>
              </div>
              <div className="space-y-2">
                {addedResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${resource.uploadStatus === 'failed' ? 'bg-red-50 border-red-200' : 'bg-[#F9FAFB] border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${resource.uploadStatus === 'uploading' ? 'bg-blue-100 text-blue-600' : resource.uploadStatus === 'failed' ? 'bg-red-100 text-red-600' : resource.type === 'internal' ? 'bg-blue-100 text-blue-600' : getCategoryColor(resource.category)}`}>
                        {resource.uploadStatus === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> : resource.uploadStatus === 'failed' ? <XCircle className="w-4 h-4" /> : getCategoryIcon(resource.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111827] truncate">{resource.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {resource.uploadStatus === 'uploading' && <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-700">Uploading...</span>}
                          {resource.uploadStatus === 'failed' && <span className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">Upload Failed</span>}
                          {resource.uploadStatus === 'success' && <span className={`text-[11px] px-2 py-0.5 rounded ${resource.type === 'internal' ? 'bg-[#EFF6FF] text-[#2D8CFF]' : 'bg-gray-100 text-gray-600'}`}>{resource.type === 'internal' ? 'Internal Note' : 'External Source'}</span>}
                          {resource.size && resource.uploadStatus === 'success' && <span className="text-[11px] text-[#6B7280]">{resource.size}</span>}
                        </div>
                        {resource.uploadStatus === 'failed' && resource.errorMessage && <p className="text-[11px] text-red-600 mt-1">{resource.errorMessage}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {resource.uploadStatus === 'failed' && (
                        <button onClick={() => handleRetryUpload(resource.id)} className="flex items-center gap-1 px-3 py-1.5 text-[#2D8CFF] hover:text-white hover:bg-[#2D8CFF] rounded-lg transition-colors text-[12px] font-medium border border-[#2D8CFF]">
                          <RefreshCw className="w-3 h-3" />Retry
                        </button>
                      )}
                      <button onClick={() => handleRemoveResource(resource.id)} className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors" disabled={resource.uploadStatus === 'uploading'}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer — always visible */}
      {(() => {
        const uploadingCount = addedResources.filter(r => r.uploadStatus === 'uploading').length;
        const failedCount = addedResources.filter(r => r.uploadStatus === 'failed').length;
        const successCount = addedResources.filter(r => r.uploadStatus === 'success').length;
        const nextDisabled = addedResources.length === 0 || uploadingCount > 0 || failedCount > 0;
        const nextLabel = uploadingCount > 0
          ? `Uploading... (${uploadingCount} pending)`
          : failedCount > 0
          ? `Fix failed uploads (${failedCount} failed)`
          : addedResources.length === 0
          ? 'Next: Prioritize'
          : `Next: Prioritize (${successCount} ${successCount === 1 ? 'resource' : 'resources'})`;
        return (
          <div className="bg-white border-t border-[#E5E7EB] px-8 py-4 flex-shrink-0">
            <div className="max-w-[860px] mx-auto flex items-center justify-between">
              <button
                onClick={onBack}
                className="text-[13px] font-medium text-[#6B7280] hover:text-[#374151] transition-colors flex items-center gap-1 font-['Inter']"
              >
                ← Back
              </button>
              <button
                onClick={onNext}
                disabled={nextDisabled}
                className={`h-[42px] px-7 rounded-full flex items-center gap-2 transition-all font-['Inter'] text-[13px] font-semibold ${
                  nextDisabled
                    ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : 'bg-[#FDEA3B] text-[#111827] hover:bg-[#FDD835] shadow-sm'
                }`}
              >
                {nextLabel} ›
              </button>
            </div>
          </div>
        );
      })()}

      {/* ====== Upload Popup ====== */}
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[680px] w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 py-4 border-b-2 border-gray-200 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-[#111827]">
                    {uploadMethod === 'files' && 'Import Local Files'}
                    {uploadMethod === 'link' && 'Paste Link or YouTube URL'}
                    {uploadMethod === 'text' && 'Paste Text Content'}
                  </h2>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">
                    {uploadMethod === 'files' && 'Select file type to browse from your device'}
                    {uploadMethod === 'link' && 'Paste a URL or YouTube video link to import'}
                    {uploadMethod === 'text' && 'Copy and paste notes or content'}
                  </p>
                </div>
                <button onClick={() => setShowUploadPopup(false)} className="p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              {/* --- Local Files --- */}
              {uploadMethod === 'files' && (
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-4">Tap a category to browse and import files from your device</p>
                  <div className="grid grid-cols-3 gap-3">
                    {/* PPT */}
                    <button onClick={() => handleFileSelect('ppt')} className="p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-200">
                        <Presentation className="w-6 h-6" />
                      </div>
                      <p className="text-[13px] font-bold text-[#111827] mb-0.5">PowerPoint</p>
                      <p className="text-[11px] text-[#6B7280]">.ppt, .pptx</p>
                    </button>
                    {/* PDF */}
                    <button onClick={() => handleFileSelect('pdf')} className="p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-[13px] font-bold text-[#111827] mb-0.5">PDF</p>
                      <p className="text-[11px] text-[#6B7280]">.pdf</p>
                    </button>
                    {/* Word */}
                    <button onClick={() => handleFileSelect('word')} className="p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-[13px] font-bold text-[#111827] mb-0.5">Word</p>
                      <p className="text-[11px] text-[#6B7280]">.doc, .docx</p>
                    </button>
                    {/* Markdown */}
                    <button onClick={() => handleFileSelect('markdown')} className="p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center group-hover:bg-teal-200">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-[13px] font-bold text-[#111827] mb-0.5">Markdown</p>
                      <p className="text-[11px] text-[#6B7280]">.md, .mdx</p>
                    </button>
                    {/* Images → Image Manager */}
                    <button onClick={() => { setShowUploadPopup(false); setSelectedImageIds([]); setShowImageManager(true); }} className="p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-[#2D8CFF] hover:bg-[#EFF6FF] transition-all text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-200">
                        <FileImage className="w-6 h-6" />
                      </div>
                      <p className="text-[13px] font-bold text-[#111827] mb-0.5">Images</p>
                      <p className="text-[11px] text-[#6B7280]">.jpg, .png (→ PDF)</p>
                    </button>
                  </div>
                </div>
              )}

              {/* --- Link / YouTube --- */}
              {uploadMethod === 'link' && (
                <div>
                  {/* Input row */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      placeholder="https://example.com or https://youtube.com/watch?v=..."
                      value={linkUrl}
                      onChange={(e) => { setLinkUrl(e.target.value); setLinkError(null); setLinkSuccess(false); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleImportLink(); }}
                      className={`flex-1 px-4 py-3 bg-white border-2 rounded-lg text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none transition-all ${linkError ? 'border-red-400 focus:border-red-400' : linkSuccess ? 'border-green-400' : 'border-gray-300 focus:border-[#2D8CFF]'}`}
                    />
                    <button
                      onClick={handleImportLink}
                      disabled={!linkUrl.trim() || linkLoading}
                      className={`px-5 py-3 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 flex-shrink-0 ${!linkUrl.trim() || linkLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#2D8CFF] text-white hover:bg-[#1D7CEF]'}`}
                    >
                      {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : linkSuccess ? <CheckCircle className="w-4 h-4" /> : null}
                      {linkLoading ? 'Importing...' : 'Import'}
                    </button>
                  </div>

                  {/* Error */}
                  {linkError && (
                    <div className="flex items-start gap-2 mb-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[12px] text-red-700">{linkError}</p>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mt-4 space-y-1.5">
                    {[
                      'Only the visible text on the website will be imported at this time.',
                      'Paid articles are not supported.',
                      'Only the text transcript in YouTube will be imported at this time.',
                      'Only public YouTube videos are supported.',
                      'Recently uploaded videos may not be available to import.',
                    ].map((note, i) => (
                      <p key={i} className="text-[11px] text-[#9CA3AF] leading-[16px]">* {note}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* --- Paste Text --- */}
              {uploadMethod === 'text' && (
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-4">Copy and paste notes, lecture transcripts, or any text content. Markdown format is auto-detected.</p>
                  <textarea
                    placeholder="Paste your text content here..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/20 transition-all resize-none mb-4"
                  />
                  <button
                    onClick={handleImportText}
                    disabled={!pastedText.trim()}
                    className={`w-full py-3 rounded-xl text-[14px] font-bold transition-all ${pastedText.trim() ? 'bg-[#2D8CFF] text-white hover:bg-[#1D7CEF] shadow-lg shadow-blue-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    Import Text
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== Markdown Confirm Dialog ====== */}
      {showMarkdownConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[420px] w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-1">Markdown Format Detected</h3>
                <p className="text-[13px] text-[#6B7280] leading-[20px]">
                  The pasted content appears to be in Markdown format. How would you like to import it?
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => commitTextImport(true)}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[14px] font-bold transition-colors"
              >
                Import as Markdown
              </button>
              <button
                onClick={() => commitTextImport(false)}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-[#374151] border-2 border-gray-200 rounded-xl text-[14px] font-semibold transition-colors"
              >
                Import as Plain Text
              </button>
              <button
                onClick={() => setShowMarkdownConfirm(false)}
                className="w-full py-2 text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Image Manager ====== */}
      {showImageManager && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[680px] w-full max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b-2 border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-[#111827]">Select Images</h2>
                <p className="text-[12px] text-[#6B7280] mt-0.5">Select up to 10 images · They'll be combined into a single PDF in order</p>
              </div>
              <button onClick={() => setShowImageManager(false)} className="p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selection bar */}
            <div className="px-5 py-2.5 bg-[#F9FAFB] border-b border-gray-200 flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">
                {selectedImageIds.length === 0 ? 'No images selected' : `${selectedImageIds.length} / 10 selected`}
              </span>
              {selectedImageIds.length > 0 && (
                <button onClick={() => setSelectedImageIds([])} className="text-[12px] text-red-500 hover:text-red-600 font-medium">
                  Clear selection
                </button>
              )}
            </div>

            {/* Image Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-4 gap-3">
                {MOCK_IMAGES.map((img) => {
                  const selected = selectedImageIds.includes(img.id);
                  const selectionOrder = selectedImageIds.indexOf(img.id) + 1;
                  const disabled = !selected && selectedImageIds.length >= 10;
                  return (
                    <button
                      key={img.id}
                      onClick={() => !disabled && toggleImageSelection(img.id)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${selected ? 'border-[#2D8CFF] shadow-md' : disabled ? 'border-gray-200 opacity-40 cursor-not-allowed' : 'border-gray-200 hover:border-[#2D8CFF]/50'}`}
                    >
                      <img src={img.thumb} alt={img.name} className="w-full h-full object-cover" />
                      {selected && (
                        <div className="absolute inset-0 bg-[#2D8CFF]/20 flex items-start justify-end p-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#2D8CFF] text-white flex items-center justify-center text-[11px] font-bold shadow">
                            {selectionOrder}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-[12px] text-[#6B7280]">
                {selectedImageIds.length > 0 && (
                  <span>Will create: <span className="font-semibold text-[#111827]">图片_{new Date().toISOString().slice(0,10).replace(/-/g,'')}_{String(imageCounter).padStart(3,'0')}.pdf</span></span>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowImageManager(false)} className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-[13px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImages}
                  disabled={selectedImageIds.length === 0}
                  className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${selectedImageIds.length > 0 ? 'bg-[#2D8CFF] text-white hover:bg-[#1D7CEF] shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Confirm ({selectedImageIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Upload Result Feedback Modal ====== */}
      {showUploadResultFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[480px] w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                上传完成
                {addedResources.filter(r => r.uploadStatus === 'success').length > 0 && (
                  <span className="text-gray-600 font-normal"> · 已上传{addedResources.filter(r => r.uploadStatus === 'success').length}份文件</span>
                )}
              </h2>
              <button onClick={() => setShowUploadResultFeedback(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5">
              {addedResources.filter(r => r.uploadStatus === 'failed' || r.uploadStatus === 'uploading').length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">{addedResources.filter(r => r.uploadStatus === 'failed').length} 个文件上传失败</p>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {addedResources.filter(r => r.uploadStatus === 'failed' || r.uploadStatus === 'uploading').map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {resource.uploadStatus === 'uploading' ? <Loader2 className="w-4 h-4 text-blue-600 flex-shrink-0 animate-spin" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                          <span className="text-sm text-gray-900 truncate">{resource.name}</span>
                        </div>
                        {resource.uploadStatus === 'uploading' ? (
                          <span className="text-sm text-gray-500 ml-4 flex-shrink-0">上传中...</span>
                        ) : (
                          <button onClick={() => handleRetryUpload(resource.id, true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 ml-4 flex-shrink-0">重试</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 pt-3 border-t border-gray-100">你可以先开始学习，稍后再重试失败文件</p>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">所有文件已成功上传</p>
                  <p className="text-xs text-gray-500">资料已添加到你的学习空间</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              {addedResources.filter(r => r.uploadStatus === 'failed').length > 0 && (
                <button onClick={handleRetryAllFailedUploads} disabled={addedResources.some(r => r.uploadStatus === 'uploading')} className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  全部重试 ({addedResources.filter(r => r.uploadStatus === 'failed').length})
                </button>
              )}
              <button onClick={() => setShowUploadResultFeedback(false)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">继续</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceCollectionScreen;
