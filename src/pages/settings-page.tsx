import { Card } from '../shared/ui/card';
import { Label } from '../shared/ui/label';
import { Button } from '../shared/ui/button';

export function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Preferências</h2>

        <div className="space-y-2">
          <Label>Idioma</Label>
          <select className="border p-2 rounded w-full">
            <option>Português</option>
            <option>Inglês</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Tema</Label>
          <select className="border p-2 rounded w-full">
            <option>Claro</option>
            <option>Escuro</option>
          </select>
        </div>

        <Button>Salvar alterações</Button>
      </Card>
    </div>
  );
}
