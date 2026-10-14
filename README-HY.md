# EOT V43 — Reliable Match Sharing

ԿԱՐԵՎՈՐ. Սա միայն Discord match-ի հղումների հուսալիության թարմացում է։
Նոր կլանների վարկանիշ կամ լրացուցիչ ֆունկցիա **չի ավելացվել**։

Նոր հղումները պարունակում են հանրային Game ID + Game Server հասցեն, երբ այն հասանելի է։
Worker-ը **ստուգում է** տվյալ հասցեն Starblast-ի հանրային feed-ի հետ։
- Միայն ճշգրիտ ակտիվ և JOIN OPEN խաղի դեպքում բրաուզերը ավտոմատ բացում է Starblast-ը։
- Փակ խաղը, հնացած հասցեն, API-ի սխալը կամ նույն ID-ով մի քանի խաղերը չեն տեղափոխում ուրիշ խաղ։
- Discord-ը շարունակում է ստանալ EOT SERVER LIST-ի անհատական OG նկարն ու match-ի տվյալները։
- SHARE MATCH-ը պատճենում է միայն հղումը, առանց կրկնվող տեքստի։

## Տեղադրում

1. Պահպանիր գործող GitHub repository-ների պատճենները (Code → Download ZIP)։
2. `king-community/eot-preview2` repository-ում ZIP-ից փոխարինիր `src/` և `tests/` ֆայլերը, ինչպես նաև package.json, wrangler.toml-ը։
3. Cloudflare Workers → eot-preview2 → Deployments-ում սպասիր հաջող Deploy-ին։
4. Հետո `king-community/eot-server-list` repository-ում փոխարինիր `index.html`-ը, որ նոր SHARE MATCH հղումները աշխատեն։
5. Փորձարկիր ԱԿՏԻՎ խաղով՝ SHARE MATCH → Discord → սեղմել link-ը։

**Կայքի հիմնական հասցեն չի փոխվում։** Եթե խնդիր լինի՝ վերադարձիր GitHub-ի նախորդ commit-ին և Cloudflare-ի նախորդ Deploy-ին։
Հանրային feed-ի ուշացումները և Discord cache-ը մեզանից անկախ են։
