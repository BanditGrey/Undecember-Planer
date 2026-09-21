# Formato da build e links

Uma build é um único objeto JSON (`src/types.ts → Build`), codificado em **base64url** de `JSON.stringify`
e colocado no hash da URL: `https://…/#b=<código>`; `&view=1` abre em modo somente leitura.
Links curtos (`#c=<id>`) só existem com a galeria hospedada configurada.

```ts
interface Build {
  v: 1;                                  // versão do formato — decodeBuild rejeita outras versões
  name: string; author: string; notes: string;
  stat: 'STR' | 'DEX' | 'INT' | 'HYBRID';
  board: Record<"q,r", Cell>;            // 37 células axiais; Cell = { rune?, runestone?, dir?, slots?, grade?, awaken? }
  equipment: Partial<Record<EquipSlot, { unique?: string; authority?: string; affixes?: string[] }>>;
  extras?: { charms: ExtraItem[]; relics: ExtraItem[]; jewels: ExtraItem[]; lacrima: Lacrima[]; notes? };
  runemaster: Record<nodeId, points>;
  zodiac?: string[];                     // ids "Spec.index" dos nós ativos
  runeLevel?: number;                    // 1..50
  runeLevelBonus?: number;               // +X nível de skill vindo de gear
  char?: { level; str; dex; int };
  dualWield?: boolean;
  dpsInput?: { weaponAvg; weaponSpeed; critChancePct; critDmgPct; charIncPct; targetResistPct; targetArmorPct };
}
```

Regras de compatibilidade:
- Todos os campos novos são **opcionais**; `decodeBuild` faz `{ ...emptyBuild(), ...b }`, então links antigos continuam abrindo.
- Runas/itens são referenciados por `slug`; se um slug sumir do banco a célula é ignorada (não quebra o link).
- Publicação por GitHub Issue embute o mesmo código em um bloco ```build``` no corpo da issue.
- Backend Supabase guarda `code` (o mesmo base64url) mais colunas denormalizadas (`stat`, `skills[]`) para busca.
