# EOT SERVER LIST — V42.5 Stable Match Preview

Այս ZIP-ը նախատեսված է միայն `king-community/eot-preview2` Cloudflare Worker repository-ի համար։
**Մի փոխիր** հիմնական `king-community/eot-server-list` կայքի `index.html`-ը։

## Ինչ է ուղղված

- Discord-ի վերնագիրը սկսվում է `EOT SERVER LIST |`-ով, հետո ցուցադրվում է խաղի իրական անունը/ռեժիմը։
- Նկարում EOT SERVER LIST-ը երևում է որպես հստակ հիմնական բրենդ, իսկ ներքևում՝ խաղի տվյալները։
- Նկարները ներսում գեներացվում են և պահուստային PNG ունեն։ Նկարի ստեղծման սովորական սխալի դեպքում արտաքին GitHub նկարի վրա հույս չի դրվում։
- Match չկա, API-ն ժամանակավորապես հասանելի չէ, կամ նույն ID-ն մի քանի սերվերում է՝ **տարբեր կարգավիճակներ են**, առանց սխալ եզրակացությունների։
- Եթե *հենց տվյալ խաղի* `players_list`-ը հասանելի է, տեսանելի clan pattern-երը հաշվարկվում են ըստ անվան սկզբի (SK, WVO, UVA, NVR և այլն)։ Երբ կազմը մասնակի է, գրվում է SAMPLE։ Սա կլանի պաշտոնական անդամակցություն չի հաստատում։
- ECP թիվը ցույց է տրվում միայն այն ժամանակ, երբ player records-ներում առկա է հստակ `ecp` boolean, իսկ մասնակի կազմի դեպքում գրվում է SAMPLE։
- Հանրային `simstatus.json`-ը Survival-ում սովորաբար չի տալիս player roster/ECP, ուստի այդ դեպքում նկարը ազնվորեն գրում է `NOT IN PUBLIC FEED`։ Այս սահմանափակումը code-only թարմացմամբ հնարավոր չէ վերացնել։
- Նկարների համար Cloudflare edge cache, դաշտերի անվտանգ մշակում, fallback, OG/Twitter metadata։

## Ապահով տեղադրում

1. GitHub > `king-community/eot-preview2` > **Code → Download ZIP**. Հին աշխատող տարբերակի backup պահիր։
2. Այս ZIP-ը Extract All արա։
3. `eot-preview2` repository-ում փոխարինիր **նույնանուն** ֆայլերը՝ root-ում `package.json`, `wrangler.toml`, իսկ `src`-ում ամբողջ նոր կոդը։ Ավելացրու նոր `src/clans.mjs`, `src/fallback.mjs` և `tests/preview.test.mjs`։
4. Եթե GitHub upload-ը թույլ չի տալիս նույնանուն ֆայլերի ուղղակի փոխարինում, դրանց բովանդակությունը փոխիր **Edit**-ով կամ ստեղծիր նոր branch և pull request։ Չջնջես գործող ֆայլերը նախապես։
5. Սեղմիր **Commit changes**։ Cloudflare > Workers & Pages > `eot-preview2` > **Deployments**՝ սպասիր հաջող deployment-ին։
6. Բացիր `https://eot-preview2.aarayik729.workers.dev/image/6584.png?region=EU&v=45`։ Եթե այդ ID-ն այլևս չկա, նկարը միևնույն է պետք է երևա՝ NOT LISTED պիտակով։
7. Discord-ում նոր Worker `/m/<ID>?region=EU` հղում ուղարկիր՝ հին preview-ները կարող են քեշավորված լինել։

## Ստուգումներ

- `npm test` կամ `node --test tests/preview.test.mjs` (Node 20+)
- `npx wrangler deploy` (եթե manual deployment է)
- Endpoint-ները՝ `/health`, `/m/<ID>?region=EU`, `/image/<ID>.png?region=EU&v=45`։

Եթե Production-ում blank page կամ error տեսնես, նախ Cloudflare > Deployments-ում ստուգիր՝ նոր commit-ը հաջող տեղադրվա՞ծ է։ Հետո DevTools > Network-ում նայիր HTTP status-ին ու Content-Type-ին։ Error-ի դեպքում Cloudflare-ում վերադարձիր նախորդ հաջող deployment-ին։

**Կարևոր**․ Cloudflare Workers Free-ը ունի CPU սահմանաչափ. տեղային թեստերը production runtime-ի երաշխիք չեն։ Եթե image endpoint-ը նորից վերադարձնի Cloudflare Error 1102, պետք է դիտել Worker-ի Metrics/Logs-ը և հետագա օպտիմիզացիա կամ նկարների նախնական cache օգտագործել։
