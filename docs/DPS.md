# Modelo de DPS (estimativa)

O planner **não reproduz a fórmula interna do jogo**; ele aplica as convenções públicas de stacking de UNDECEMBER
a todas as linhas de stat que consegue parsear. Serve para comparar builds e escolhas, não para prever números do cliente.

## Fontes de modificadores (por skill do tabuleiro)
1. Stats da própria skill no nível escolhido (`level.ts` interpola Lv1→Lv45; ≥46 marcado como *estimado*).
2. Link runes vinculadas e válidas (stats no mesmo nível) + bônus de grau (N/M/R/L) + linha de awakening.
3. Runestones colocadas no tabuleiro.
4. Nós do Mestre de Runas com pontos.
5. Nós ativos do Zodíaco (linhas incondicionais; "com arma de 2 mãos/1 mão" só conta com a arma equipada / flag dual wield).
6. Únicos, autoridades e afixos raros por slot.
7. Extras: charms, relíquias, joias e Lacrima (Lacrima × taxa de absorção).

## Classificação de linhas (`classify`)
| Padrão | Tipo | Stacking |
|---|---|---|
| `+X% … DMG` | `inc` | aditivo entre si |
| `X% DMG Amplification` | `amp` | aditivo entre si, multiplicado depois |
| `… Multiplier` | `more` | multiplicativo |
| `Dampening` | `less` | multiplicativo (1−X) |
| `+X … DMG` (sem %) | `flat` | somado à base |

Linhas condicionais (*against*, *when*, *if*, *per*…) são ignoradas. Linhas com tag (`Melee DMG`, `Fire DMG`,
`Projectile DMG`…) só se aplicam se a skill possuir a tag — após `Convert X DMG` alterar o elemento efetivo.

## Fórmula
```
hit      = (weaponAvg × basePct/100 + flat) × (1 + Σinc/100) × (1 + Σamp/100) × Πmore × Π(1 − less)
critCh   = min(100, critChancePct_input × (1 + Σ"Critical Rate %"/100))
critDmg  = critDmgPct_input + Σ"Critical DMG"
resist   = max(0, (alvo: resistência se skill elemental/spell, senão armadura) − Σpenetração)
avgHit   = hit × (1 − resist/100) × (1 + critCh/100 × (critDmg/100 − 1))
hits/s   = weaponSpeed × (1 + Σvelocidade de ataque|cast /100)
DPS      = skill com cooldown ? avgHit / cooldown : avgHit × hits/s
```
Os valores de entrada (arma média, velocidade, crítico, alvo) ficam salvos na build (`dpsInput`), então o link
carrega as premissas usadas. Cartões de preset mostram apenas dano por hit.

## Limitações conhecidas
- Sem modelagem de DoT, minions, número de projéteis, área, ailments ou uptime de buffs.
- Skills sem números publicados (`unofficial: true`) não recebem DPS.
- Armadura do jogo não é percentual fixa; use o campo "armadura do alvo" como aproximação.
