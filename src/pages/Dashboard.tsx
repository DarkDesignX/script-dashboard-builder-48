import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScriptTable } from "@/components/ScriptTable";
import { ScriptDialog } from "@/components/ScriptDialog";
import { Script, Customer } from "@/types/script";
import { Plus, Terminal, Package, Shield, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import hejubaLogo from "@/assets/hejuba-logo.png";


export const Dashboard = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | undefined>();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scriptsData, customersData] = await Promise.all([
        apiService.getScripts(),
        apiService.getCustomers()
      ]);
      setScripts(scriptsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Daten konnten nicht geladen werden. Bitte stellen Sie sicher, dass der Server läuft.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (script: Script) => {
    setEditingScript(script);
    setIsDialogOpen(true);
  };

  const handleDelete = async (script: Script) => {
    try {
      await apiService.deleteScript(script.id);
      setScripts(prev => prev.filter(s => s.id !== script.id));
      toast({
        title: "Skript gelöscht",
        description: `"${script.name}" wurde erfolgreich gelöscht.`,
      });
    } catch (error) {
      console.error('Failed to delete script:', error);
      toast({
        title: "Fehler",
        description: "Skript konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (scriptData: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingScript) {
        // Update existing script
        const updatedScript = await apiService.updateScript(editingScript.id, scriptData);
        setScripts(prev => prev.map(s => 
          s.id === editingScript.id ? updatedScript : s
        ));
        toast({
          title: "Skript aktualisiert",
          description: `"${scriptData.name}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        // Create new script
        const newScript = await apiService.createScript(scriptData);
        setScripts(prev => [...prev, newScript]);
        toast({
          title: "Skript erstellt",
          description: `"${scriptData.name}" wurde erfolgreich erstellt.`,
        });
      }
      setEditingScript(undefined);
    } catch (error) {
      console.error('Failed to save script:', error);
      toast({
        title: "Fehler",
        description: editingScript ? "Skript konnte nicht aktualisiert werden." : "Skript konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleNewScript = () => {
    setEditingScript(undefined);
    setIsDialogOpen(true);
  };

  const getStatistics = () => {
    const totalScripts = scripts.length;
    const globalScripts = scripts.filter(s => s.isGlobal).length;
    const autoEnrollmentScripts = scripts.filter(s => s.autoEnrollment).length;
    const categories = scripts.reduce((acc, script) => {
      acc[script.category] = (acc[script.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalScripts,
      globalScripts,
      autoEnrollmentScripts,
      categories,
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient background */}
      <div className="bg-gradient-primary text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src={hejubaLogo} alt="HEJUBA" className="h-12 w-auto" />
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Terminal className="h-8 w-8" />
                  PowerShell Script Management Dashboard
                </h1>
                <p className="text-white/80 mt-1">
                  Verwalten Sie Ihre PowerShell-Skripte zentral und effizient
                </p>
              </div>
            </div>
            <Button 
              onClick={handleNewScript}
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neues Skript
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamt Skripte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{stats.totalScripts}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Globale Skripte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold text-foreground">{stats.globalScripts}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Auto Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold text-foreground">{stats.autoEnrollmentScripts}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktive Kunden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold text-foreground">{customers.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        {loading ? (
          <Card className="bg-gradient-secondary border-border shadow-card">
            <div className="p-6">
              <div className="text-center py-12">
                <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Daten werden geladen...
                </h3>
                <p className="text-muted-foreground">
                  Bitte warten Sie einen Moment.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <ScriptTable
            scripts={scripts}
            customers={customers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Script Dialog */}
        <ScriptDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          script={editingScript}
          customers={customers}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};