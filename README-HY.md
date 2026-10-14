# EOT SERVER LIST — V42.8 · Match Status Upgrade

Սա **eot-preview2** Cloudflare Worker-ի թարմացումն է։ Հիմնական EOT կայքի `index.html`-ը **չի փոխվում**։

## Ի՞նչ է փոխվել

- Match-ը հանրային ցուցակում է՝ **IN PROGRESS**։
- `open: true` նշանակում է **JOIN OPEN** (կարելի է միանալ)։
- `open: false` նշանակում է **JOIN CLOSED** (նոր խաղացողի մուտքը փակ է, բայց match-ը պարտադիր չէ ավարտված լինի)։
- `open` բացակայում է՝ **JOIN STATUS UNKNOWN**։
- Match չկա՝ **NOT CURRENTLY LISTED**՝ առանց հայտարարելու, որ խաղն ավարտվել է։
- Feed-ի սխալը՝ **MATCH DATA TEMPORARILY UNAVAILABLE**՝ չշփոթելով ավարտված խաղի հետ։

Discord-ում embed-ի մեծ վերնագիրը մնում է **EOT SERVER LIST**։ Վիճակը ցուցադրվում է նկարագրության ու նկարում։ Match-ի անունը, players-ը, ECP/clans դաշտերի վստահելիությունը և գործող redirect-ը չեն փոխվել։

## Ինչպես տեղադրել անվտանգ

1. GitHub-ում բացիր `king-community/eot-preview2`։ Ընտրիր **Code → Download ZIP** և պահպանիր backup։
2. Նոր փաթեթի `src/markup.mjs`, `src/png.mjs`, `tests/preview.test.mjs` ֆայլերը փոխարինիր նույն ուղիներով։ Կարող ես նաև ամբողջական ZIP-ը բացել ու վերբեռնել պահելով պանակների կառուցվածքը։
3. GitHub-ում արա commit։ Cloudflare **Workers & Pages → eot-preview2 → Deployments**-ում համոզվիր, որ նոր տարբերակն ակտիվ է։
4. Հին Discord preview-ն կարող է քեշավորված մնալ։ Ստուգիր ակտիվ match-ի նոր հղումով կամ ավելացրու նոր `?region=EU&v=48` տարբերակը միայն թեստավորման համար։
5. Եթե խնդիր լինի՝ Cloudflare Deployments-ում վերադարձիր նախորդ աշխատող տարբերակին։

## Սահմանափակումներ

Worker-ը հիմնվում է Starblast հանրային feed-ի վրա։ Տվյալների ճշգրտությունը և թարմացումը կախված են feed-ից։ `IN PROGRESS` նշանակում է, որ match-ը **այժմ ցուցակում է**. դա անկախ server-side heartbeat չէ։
