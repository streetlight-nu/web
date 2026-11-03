# Egenhostade verktyg för Nyheter med e-post: jämförelse och rekommendation

Hämtat och sammanställt 2026-11-03 direkt från primärkällor (projektens egen dokumentation, deras GitHub-filer via `raw.githubusercontent.com`, leverantörernas egna pris- och dokumentationssidor, Googles och Yahoos avsändarkrav). Kompletterar `docs/research/epostutskick-tjanster.md` (SaaS-jämförelsen, Repejo-webhooken och GDPR-avsnittet). Den filen är oförändrad och dupliceras inte här; kravbilden, Repejo-fynden och rättskällorna hänvisas till därifrån. Inget i repot är kopplat.

Kravbilden är densamma som i grannfilen: högst några hundra mottagare, Repejos webhook (`Repejo-Signature`, HMAC-SHA256 över råa bodyn) ska skapa kontakt och starta onboarding-mejl, mejlen ska följa Streetlights varumärke med egna typsnitt, redaktörerna är icke-tekniska och vill ha en visuell editor, GDPR och EU-hosting väger tungt, dubbel opt-in och avanmälan krävs.

## Läs detta först: hur källorna hämtades

- **[P]** = sidan eller filen hämtades i fulltext 2026-11-03 och påståendet är läst i primärkällan. Källans URL står vid påståendet.
- **[S]** = söksammanfattning. Inga [S]-påståenden används i den här filen; allt är hämtat direkt.
- **OVERIFIERAT** = gick inte att belägga i någon hämtad källa. Det betyder inte att funktionen saknas.
- **Egen slutsats** = min läsning av flera belagda fakta. Märkt så, och inte ett juridiskt uttalande.

Nätverket tillät primärhämtning av nästan allt via `curl` genom sessionens proxy. Begränsningar som påverkar slutsatserna:

- **GitHubs API och releasesidor gav 403** (`api.github.com/repos/...`, `github.com/.../releases`, `.../commits/*.atom`, `codeload.github.com`), och GitHub-verktyget i sessionen är begränsat till `streetlight-nu/web`. Jag har inte bett om att koppla in fler repon. Följd: **senaste release och senaste commit går inte att läsa från projektens GitHub-sidor.** Underhållsstatus bygger i stället på (a) projektens egna `CHANGELOG.md`/README i repot, (b) projektens egna pakettaggar på Docker Hub (`last_updated`) och Packagist, (c) projektens egna webbsidor. Det är tidpunkter för publicerade paket, inte GitHub-commits. Commit-aktivitet är OVERIFIERAT för alla kandidater.
- `upcloud.com/pricing` och flera andra UpCloud-sidor gav 403. **UpCloud-priser är OVERIFIERADE.**
- `help.mailgun.com` gav 403; `help.brevo.com` lästes via Brevos Zendesk-API (samma metod som i grannfilen).
- `eur-lex.europa.eu` blockerar; GDPR-texten lästes från EU:s publikationsbyrå (samma som grannfilen).
- Priser anges i den valuta sidan visar och är exklusive moms/skatt om inget annat sägs. Ingen omräkning görs. Momsbehandling för föreningen är inte bedömd.

## Sammanfattning och rekommendation

1. **SaaS är fortsatt rimligast för en förening av den här storleken, om ingen i föreningen faktiskt vill driva servern.** Infrastrukturkostnaden för egen drift är i samma storleksordning som SaaS (VPS från 5,99 EUR/mån [P] plus ett relä som kostar några cent per månad vid några tusen mejl), så pengarna avgör inte. Det som avgör är vem som patchar, säkerhetskopierar och larmas när något går sönder, och att inget av de öppna verktygen tar emot Repejos webhook direkt (se kärnfråga 4). Se "Rekommendation och villkor".
2. **Om föreningen ändå vill hosta själv: skicka via ett relä, inte från egen IP.** Hetzner blockerar port 25 och 465 på molnservrar som standard och öppnar dem först efter en månad och en betald faktura, efter ansökan [P]. Google och Yahoo kräver PTR-poster för sändande IP och Yahoo nedgraderar IP:n om den saknas [P]; en ny IP får ingen historik, och Postals egen FAQ säger att nya IP:n som skickar stora volymer "will likely not deliver well initially" [P]. Reläalternativ som källorna stöder: **Amazon SES i Europa (Stockholm, `eu-north-1`)** eller **Brevo SMTP** (reläserver som enligt Brevo vidarebefordrar till datacenter i Europa). Scaleway TEM går inte: Scaleway skriver uttryckligen att TEM bara är för transaktionsmejl och inte får användas för marknadsföring [P]. Postmark har servrar i USA utan planer på EU [P].
3. **Om egen drift: listmonk eller Keila, inte Mautic/phpList/Mailtrain/Postal.**
   - **listmonk** (AGPLv3, en Go-binär plus PostgreSQL ≥ 12, svenskt språkpaket finns, dubbel opt-in per lista, API med `preconfirm_subscriptions`, transaktions-API, bounce-webhooks för SES m.fl.) är det mognaste. Ingen automation/flerstegsserie är dokumenterad.
   - **Keila** (AGPLv3, Elixir/Docker plus PostgreSQL ≥ 14, svensk översättning sedan 0.40.0, formulär med dubbel opt-in som kan startas via API, redigerbara välkomst- och DOI-mejl, blockeditor, SES-bounce automatiskt) passar bäst på papperet för redaktörerna, men är före version 1.0 och saknar dokumenterad serieautomation.
   - **Mautic** är det enda av de öppna verktygen med en dokumenterad kampanjbyggare (automation) och dokumenterade egna typsnitt i editorn, men kräver PHP 8.2+, MySQL 8.4+/MariaDB 10.11+, cron och har ingen dokumenterad dubbel opt-in. För några hundra mottagare är det för tungt.
4. **Onboarding-serie (flera mejl över tid) är det som skiljer.** Av de öppna verktygen dokumenterar bara Mautic (och Mailtrain v2, som ser övergivet ut) automation. listmonk och Keila kan skicka första välkomstmejlet (listmonk: transaktions-API; Keila: välkomstmejl i formuläret) men en serie kräver en schemaläggare i mellanledet.
5. **Repejo-kopplingen kräver ett mellanled oavsett val**, precis som för SaaS (grannfilen). Ingen kandidats dokumentation beskriver en inkommande webhook med Repejos HMAC-signatur.

## Kravmatris

V = belagt [P] i projektets egen källa, ? = OVERIFIERAT, Nej = belagt att det saknas. Källor per cell finns i per-kandidat-avsnitten. "Relä" avser vad som behövs för att nå inkorgar.

| Krav | listmonk | Keila | Mautic | phpList | Mailtrain | Sendy | Postal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Licens | AGPL-3.0 | AGPL-3.0 | GPL-3.0 | AGPL-3.0 | GPL-3.0 (v2) | **Proprietär, ej öppen källkod** (licensnyckel per domän) | ? ingen licensfil hittad |
| Typ | Nyhetsbrev/listhanterare | Nyhetsbrevsverktyg | Marknadsautomation | Nyhetsbrev/listhanterare | Nyhetsbrev | Nyhetsbrev via SES | **Mailserver (MTA)**, uttryckligen ingen listhanterare |
| Senaste paket (se begränsning) | stabil v6.2.0 (Docker-tagg 2026-06-26); v7.0.0-beta.1 (2026-10-20) | 0.40.1 (Docker-tagg 2026-10-31) | 7.2.2 (2026-10-26); 6.0.10 | 3.6.17 och 3.7.0 (Docker-tagg 2026-10-24) | Docker "latest" 2021-07-26; v1 på master "deprecated" | v7.1.7 (visas på sendy.co) | 3.3.7 (2026-06-03) |
| Språk/databas | Go, PostgreSQL ≥ 12 | Elixir (Docker), PostgreSQL ≥ 14 | PHP 8.2-8.5, MySQL ≥ 8.4 / MariaDB ≥ 10.11 | PHP (8.1+), MySQL/MariaDB, Apache | Node.js 14+, MySQL 8+/MariaDB 10+, i Docker-stack även MongoDB och Redis | PHP, MySQL/MariaDB | Ruby/Docker, MariaDB ≥ 10.6 |
| Minne/CPU (dokumenterat) | Produktionsinstans med 7 miljoner mejl: toppminne 57 MB | ? | ? (sidan om krav anger inget RAM) | ? | Rekommenderat: 2 vCPU, 4 GB | ? | Minst 4 GB RAM, 2 kärnor, 25 GB disk, dedikerad server |
| Relä | SMTP (flera köer) | SMTP, AWS SES, Sendgrid, Mailgun, Postmark | SMTP/Symfony Mailer DSN | SMTP/PHPMailer, SES inbyggt | Inbyggd Zone-MTA eller SMTP | Amazon SES eller SMTP-leverantörer | Är själv mailservern (egen IP, port 25 ut) |
| Visuell editor | Dra-och-släpp-byggare, WYSIWYG, Markdown, HTML (enligt listmonk.app; om byggaren finns i stabil 6.2.0 är OVERIFIERAT) | Blockeditor, Markdown, text, HTML/MJML-mallar | Dra-och-släpp (GrapesJS) | CKEditor-plugin nämns; övrigt ? | Mosaico/GrapesJS/Summernote (v1-ändringslogg); v2 MJML | Dra-och-släpp, WYSIWYG, HTML | Nej (inget) |
| Egna typsnitt | Egen HTML-mall, `@font-face` i HTML är tekniskt möjligt, ej dokumenterat | ? (HTML/MJML-mallar finns) | **V:** `editor_fonts` i `local.php` med CSS-URL (Mautic 5.x+) | ? | ? | ? | Ej relevant |
| API kontakt-upsert | `POST /api/subscribers` (skapa), `PATCH` på id; upsert-semantik ? | `POST`/`PUT`/`PATCH /api/v1/contacts`, id kan vara e-post | `POST /contacts/new`, `PUT .../edit` med createIfNotFound | REST-API i kärnan sedan 3.4.0; detaljer ? | ? | `POST /subscribe` skapar **eller uppdaterar** | Ej relevant |
| Inkommande webhook (generisk) | Nej dokumenterad (webhooks finns för bounce) | Nej dokumenterad | Nej dokumenterad (bara utgående "Send a Webhook") | ? | ? | Nej (Rules & Webhooks är utgående) | Ej relevant |
| Automation/onboarding-serie | **Ingen dokumenterad**; transaktions-API för enstaka mejl | **Ingen dokumenterad**; välkomstmejl per formulär | **V:** kampanjbyggare (segment/formulär som ingång, mejl, villkor, fördröjning) | ? (RSS-kampanjer, schemaläggning) | V (v2): triggered och RSS-kampanjer | **V:** autoresponders (drip) | Nej |
| Dubbel opt-in | V: lista med opt-in "double", `/optin`-endpoint | V: formulär `double_opt_in_required`, API-submit startar DOI | **Ej dokumenterad** | V: bekräftelse-URL (`?p=confirm`) | ? | V | Nej |
| Avanmälan, List-Unsubscribe | V: `{{ UnsubscribeURL }}`, List-Unsubscribe + One-Click Post i koden | V: ett-klicks-länk `{{ unsubscribe_link }}`, header (ändringslogg) | V: tokens, preferensCenter, List-Unsubscribe via IMAP-adress | V: List-Unsubscribe + One-Click Post i koden | ? | V (avanmälan hanteras automatiskt) | Nej (uttryckligen utanför scope) |
| Bounce-hantering | POP3 + webhooks för SES, Sendgrid, Postmark, Azure, Forward Email, Lettermint | Automatisk för AWS SES; övriga relän ? | IMAP + callback för Elastic Email, SparkPost, Mandrill, Mailjet, SendGrid, SES | POP3/cron; policy- och regexbaserad | ? | Automatisk (via SES) | Ja, som MTA (spärrlista) |
| Svenskt gränssnitt | **V** (`i18n/sv.json`) | **V** (svensk översättning tillagd i 0.40.0) | ? (Transifex, svenska ej bekräftat) | Delvis: Swedish finns i översättningsprojektet, andel oviss (tolkad ca 38 %) | ? | ? | Nej |
| Backup/uppgradering | `pg_dump` + binär/Docker, `--upgrade`, nedgradering kräver DB-återställning | Docker-bild + Postgres (rutin ej läst) | Composer/uppdaterare, cron | Backup av DB + filer, uppgraderingslänk | ? | "Get updated" från sendy.co | `postal` CLI-uppgradering (sida finns, ej läst) |

## Per kandidat

Alla källor hämtade 2026-11-03, alla [P] om inget annat anges.

### listmonk

- **Licens.** [P] AGPL-3.0: README säger "licensed under AGPLv3", LICENSE-filen är GNU Affero General Public License version 3. Källa: https://raw.githubusercontent.com/knadh/listmonk/master/README.md, https://raw.githubusercontent.com/knadh/listmonk/master/LICENSE
- **Underhåll.** [P] Startsidan: "The latest version is v7.0.0-beta.1 released on 20 Oct 2026"; Docker Hub-taggar: v6.2.0 (2026-06-26), v6.1.0 (2026-03-29), v6.0.0 (2026-01-02), v5.1.0 (2025-09-09), plus nightly-bygge 2026-11-02. Datumen är Docker Hub-taggarnas `last_updated`, inte GitHub-releasedatum. Källa: https://listmonk.app/, https://hub.docker.com/v2/repositories/listmonk/listmonk/tags
- **Drift.** [P] "A simple binary application that requires a Postgres database instance", Postgres ≥ 12, binär eller Docker Compose. Startsidan: en produktionsinstans som skickar 7+ miljoner mejl har toppminne 57 MB. Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/installation.md, https://listmonk.app/
- **Relä.** [P] SMTP (standard). Flera SMTP-köer. Förinställning för Azure ACS finns. Källa: https://listmonk.app/, https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/bounces.md
- **Editor, mallar.** [P] Startsidan: "visual drag-and-drop builder, a WYSIWYG editor, Markdown, raw syntax-highlighted HTML, or just plain text"; mallar i HTML med Go-mallspråk, `{{ template "content" . }}`. Att dra-och-släpp-byggaren ingår i stabil 6.2.0 och inte bara i 7.0-betan går inte att utläsa av sidan: OVERIFIERAT. Egna typsnitt: dokumentationens mallexempel använder `<style>` i HTML-mallen, så `@font-face` med länk till föreningens egen CSS är tekniskt möjligt men står inte i dokumentationen: OVERIFIERAT. Gmail stöder inte alla webbtypsnitt (grannfilen), så fallback behövs. Källa: https://listmonk.app/, https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/templating.md
- **API.** [P] `POST /api/subscribers` (e-post, namn, status `enabled`/`blocklisted`, `lists`, `attribs`, `preconfirm_subscriptions`: "If true, subscriptions are marked as confirmed and no opt-in emails are sent for double opt-in lists"). `POST /api/subscribers/{id}/optin` skickar bekräftelsemejl. `POST /api/public/subscription` (e-post, namn, `list_uuids`). `PATCH /api/subscribers/{id}` slår ihop attribut. Någon dokumenterad upsert på e-post i ett anrop hittades inte: skapa med en befintlig e-post är OVERIFIERAT (kan ge fel). Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/apis/subscribers.md
- **Transaktions-API.** [P] `POST /api/tx` skickar mejl med färdig mall till en eller flera prenumeranter, med fritt `data`-objekt. Kan användas för första välkomstmejlet efter webhooken. Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/apis/transactional.md
- **Dubbel opt-in.** [P] Listor är single eller double opt-in; prenumeranter får status `unconfirmed`/`confirmed`/`unsubscribed`; bara bekräftade får kampanjer på double opt-in-listor; `{{ OptinURL }}` i mall. Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/concepts.md, templating.md
- **Avanmälan.** [P] `{{ UnsubscribeURL }}` ("Unsubscription and Manage preferences URL"). I koden sätts `List-Unsubscribe-Post: List-Unsubscribe=One-Click` och `List-Unsubscribe` på utskick (villkorat av en inställning; vilken inställning är inte läst). Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/templating.md, https://raw.githubusercontent.com/knadh/listmonk/master/internal/manager/manager.go
- **Bounce.** [P] POP3-brevlåda med klassificering, webhook-API `POST /webhooks/bounce`, externa webhooks: Amazon SES, Azure ACS, Sendgrid, Postmark, Forward Email, Lettermint. Brevo och Mailgun finns inte i listan (bounces från dem kräver POP3/egen skript mot webhook-API:t). Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/bounces.md
- **Automation.** Ingen sida om automation, drip eller arbetsflöden hittades i dokumentationen (sökt på automation, drip, workflow, sequence, autoresponder i alla hämtade sidor). Att den saknas i koden är OVERIFIERAT; i dokumentationen är den inte beskriven. Startsidan beskriver listmonk som "one-way mailing list". Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/index.md
- **Svenska.** [P] `i18n/sv.json` finns i repot ("Svenska (sv)"); språkpaket kan även laddas med `--i18n-dir`. Källa: https://raw.githubusercontent.com/knadh/listmonk/master/i18n/sv.json, https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/i18n.md
- **Backup/uppgradering.** [P] "Always take a backup of the Postgres database before upgrading"; binär: byt fil och `./listmonk --upgrade` (idempotent); Docker: `docker compose pull` och `up`. Nedgradering: återställ DB för den versionen. Källa: https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/upgrade.md

### Keila

- **Licens.** [P] AGPL-3.0 (README: "GNU Affero General Public License ... version 3, or (at your option) any later version"); loggan och `extra`-katalogen omfattas inte. Källa: https://raw.githubusercontent.com/pentacent/keila/main/README.md
- **Underhåll.** [P] Version 0.40.1 i CHANGELOG och `mix.exs` (säkerhetsfix för lagrad XSS i formulär och kampanjer, "updating is recommended"); Docker Hub-taggar 0.40.1 (2026-10-31), 0.40.0 (2026-10-29), 0.30.3 (2026-09-06). Versionsnumret är under 1.0. Källa: https://raw.githubusercontent.com/pentacent/keila/main/CHANGELOG.md, https://raw.githubusercontent.com/pentacent/keila/main/mix.exs, https://hub.docker.com/v2/repositories/pentacent/keila/tags
- **Drift.** [P] Officiell Docker-bild `pentacent/keila` plus PostgreSQL; ändringsloggen 0.40.0: "Keila now requires PostgreSQL 14 or newer". Bakom omvänd proxy måste WebSockets vidarebefordras. RAM-krav: OVERIFIERAT. Källa: https://www.keila.io/docs/installation, https://raw.githubusercontent.com/pentacent/keila/main/CHANGELOG.md
- **Relä.** [P] Sändare: SMTP, AWS SES, Sendgrid, Mailgun (även EU-endpoint, ändringslogg), Postmark. README: "For smaller newsletters, you can use your own email inbox". Källa: https://www.keila.io/docs/senders, https://raw.githubusercontent.com/pentacent/keila/main/README.md, CHANGELOG.md
- **Editor, mallar.** [P] Kampanjer: blockeditor, Markdown-editor, ren text; Liquid-mallspråk; sedan 0.30 även MJML-, HTML- och textmallar med innehållsplatser; välkomst- och DOI-mejl kan redigeras med hela editorn (0.40.0). Egna typsnitt: OVERIFIERAT (HTML/MJML-mallar gör `@font-face` tekniskt möjligt men det är inte dokumenterat). Källa: https://www.keila.io/docs/campaigns, CHANGELOG.md
- **API.** [P] Kontakter: `POST /api/v1/contacts`, `GET/PUT/PATCH/DELETE /api/v1/contacts/{id}` där id kan vara kontakt-id, e-post eller externt id (`id_type`); `PATCH .../data` slår ihop fritt datafält. Formulär: `POST /api/v1/forms/{id}/actions/submit` ("particularly useful if you want to start the Double-Opt-In process"). Skapar `PUT` en saknad kontakt? OVERIFIERAT. Källa: https://www.keila.io/docs/api/contacts, https://www.keila.io/docs/api/forms
- **Dubbel opt-in.** [P] Formulärinställning `double_opt_in_required`, `double_opt_in_message`, `double_opt_in_url`, redigerbart DOI-mejl med `{{ double_opt_in_link }}`. Källa: https://www.keila.io/docs/api/forms
- **Avanmälan.** [P] `{{ unsubscribe_link }}` är "URL of the one-click unsubscription link"; ändringsloggen (0.5.x) nämner att `List-Unsubscribe` och `Precedence`-headers åter skickas; `DISABLE_PRECEDENCE_HEADER` finns. Källa: https://www.keila.io/docs/campaigns, https://www.keila.io/docs/configuration, CHANGELOG.md
- **Bounce.** [P] Ändringslogg 0.6.0: "Automatic handling of bounces and complaints for AWS SES". För SMTP/Mailgun/Postmark/Sendgrid är bounce-hantering OVERIFIERAT. Källa: CHANGELOG.md
- **Automation.** Ingen automation eller serie hittades i dokumentationens sidlista eller ändringsloggen (sökt på automation, sequence, webhook). Välkomstmejl per formulär finns. OVERIFIERAT att serier saknas helt; de är inte dokumenterade.
- **Svenska.** [P] "Added Swedish translation" i 0.40.0; `priv/gettext/sv/LC_MESSAGES/default.po` finns. Källa: CHANGELOG.md, https://raw.githubusercontent.com/pentacent/keila/main/priv/gettext/sv/LC_MESSAGES/default.po
- **Anmärkning.** Keila har ett eget hostat alternativ (Keila Cloud, "Made in Germany. Hosted in the EU" på sajten). Det är ett SaaS-alternativ som inte är jämfört i grannfilen och här bara noterat; avtal, DPA och pris är OVERIFIERADE. Källa: https://www.keila.io/docs/installation

### Mautic

- **Licens.** [P] GPL-3.0 (`composer.json` på 7.x-grenen och Packagist-posten för `mautic/core`). Källa: https://raw.githubusercontent.com/mautic/mautic/7.x/composer.json, https://repo.packagist.org/p2/mautic/core.json
- **Underhåll.** [P] Mautic 7 är aktiv LTS: senaste 7.2.2 (Packagist 2026-10-26), patchversioner månadsvis, nya mindre versioner var tredje månad. Mautic 6.0.10 (Docker 2026-10-26) får säkerhetsstöd till 30 september 2026, det vill säga 6.0 är redan utanför stöd per 2026-11-03; Mautic 5.2 säkerhetsstöd till 30 juni 2026. Källa: https://www.mautic.org/mautic-releases
- **Drift.** [P] PHP 8.2-8.5 för Mautic 7; MySQL ≥ 8.4 eller MariaDB ≥ 10.11 (Mautic 7); många PHP-tillägg; npm krävs från 5.0; Apache eller Nginx; "Shared Hosting Not Recommended", rekommenderar VPS eller dedikerad server. RAM-krav anges inte (OVERIFIERAT); installationsguiden varnar att `memory_limit` kan vara för lågt "with large datasets". Cron-jobb krävs för segment- och kampanjkörning. Källa: https://mautic.org/mautic-requirements/, https://docs.mautic.org/en/6.0/getting_started/how_to_install_mautic.html, https://docs.mautic.org/en/7.0/channels/emails.html
- **Relä.** [P] Symfony Mailer med DSN; SMTP är standard. Källa: https://docs.mautic.org/en/6.0/configuration/settings.html
- **Editor, typsnitt.** [P] GrapesJS-baserad dra-och-släpp-byggare för mejl och landningssidor. Egna typsnitt: "From Mautic 5.x you can extend the Style Manager > Typography > Fonts list to include custom fonts" via `editor_fonts` i `app/config/local.php` med unikt namn och giltig CSS-URL. Källa: https://docs.mautic.org/en/7.0/builders/email_landing_page.html
- **API.** [P] `POST /contacts/new`, `POST /contacts/batch/new`, `PATCH`/`PUT /contacts/ID/edit`; PUT med `createIfNotFound`. Källa: https://devdocs.mautic.org/en/7.0/rest_api/contacts.html
- **Inkommande webhook.** Dokumentationen beskriver utgående webhooks ("Send a Webhook" som kampanjåtgärd) och en Zapier-plugin. En generisk inkommande webhook hittades inte: OVERIFIERAT. Källa: https://docs.mautic.org/en/7.0/campaigns/campaign_builder.html, https://docs.mautic.org/en/7.0/plugins/zapier.html
- **Automation.** [P] Kampanjbyggaren: ingång via segment eller formulär, åtgärder (skicka mejl med fördröjning, ändra segment, webhook), villkor och beslut. Källa: https://docs.mautic.org/en/7.0/campaigns/campaign_builder.html
- **Dubbel opt-in.** I 6.0- och 7.0-dokumentationen för mejl, formulär, kontakter och kampanjer hittades ingen beskrivning av dubbel opt-in (bara "double opt out" för `{resubscribe_url}`). **Ingen inbyggd DOI är dokumenterad**; den får byggas av formulär plus kampanj (egen slutsats) eller finnas i en plugin (OVERIFIERAT). Källa: https://docs.mautic.org/en/7.0/channels/emails.html, https://docs.mautic.org/en/7.0/components/forms.html
- **Avanmälan.** [P] Tokens `{unsubscribe_text}`, `{unsubscribe_url}`, `{dnc_url}`, `{resubscribe_url}`, preferenscenter, IMAP-övervakning av avanmälningsmapp; "the return-path or the list-unsubscribe header" använder en +-adress. En ett-klicks-POST-header är inte omnämnd i det som lästes: OVERIFIERAT. Källa: https://docs.mautic.org/en/7.0/channels/emails.html
- **Bounce.** [P] IMAP-övervakning och webhook-callback `https://<mautic>/mailer/callback` för Elastic Email, SparkPost, Mandrill, Mailjet, SendGrid och Amazon SES. Brevo och Mailgun nämns inte. Källa: https://docs.mautic.org/en/7.0/channels/emails.html
- **Svenska.** Översättning sker via Transifex; om svenska finns är OVERIFIERAT. Källa: https://docs.mautic.org/en/7.0/translations/translations.html

### phpList

- **Licens.** [P] AGPL-3.0 (LICENSE-fil och README-märke). Källa: https://raw.githubusercontent.com/phpList/phplist3/main/LICENSE, README.md
- **Underhåll.** [P] Docker Hub: 3.6.17 och 3.7.0 (2026-10-24), 3.7.0-RC5 (2026-08-09). Packagist visar `phplist/core` v5.0.0-alpha8 (2025-07-02), det vill säga en pågående omskrivning (v5) som inte är stabil. Källa: https://hub.docker.com/v2/repositories/phplist/phplist/tags, https://repo.packagist.org/p2/phplist/core.json
- **Drift.** [P] MySQL eller MariaDB, Apache, PHP 8.1 eller senare med listade tillägg; REST-API kräver PHP 7. Sidan har motstridiga uppgifter om lägsta PHP-version (8.1 respektive 7.0 för 3.6); RAM anges inte. Källa: https://resources.phplist.com/system/start
- **Relä.** [P] PHPMailer-SMTP (`PHPMAILERHOST`), annars `mail()`; "Amazon SES: built-in optimised support" i README. Källa: https://raw.githubusercontent.com/phpList/phplist3/main/public_html/lists/config/config.php, README.md
- **Dubbel opt-in.** [P] Standardkonfigurationen har `confirmationurl` ("URL where subscribers have to confirm their subscription", `?p=confirm`). Källa: https://raw.githubusercontent.com/phpList/phplist3/main/public_html/lists/admin/defaultconfig.php
- **Avanmälan.** [P] Koden sätter `List-Unsubscribe` och `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. Källa: https://raw.githubusercontent.com/phpList/phplist3/main/public_html/lists/admin/sendemaillib.php
- **Bounce.** [P] POP3-brevlåda, cron eller manuell körning; "Without processing of bounces your system will end up sending large amounts of ..." (config.php-kommentar). Källa: config.php
- **API.** [P] REST-API ingår i kärnan sedan 3.4.0 (äldre plugin finns). Upsert-semantik: OVERIFIERAT. Källa: https://resources.phplist.com/plugin/restapi
- **Editor.** CKEditor-plugin nämns ("GD required by CKEditor Plugin only"); dra-och-släpp, mallar och egna typsnitt: OVERIFIERAT. Källa: https://resources.phplist.com/system/start
- **Svenska.** Översättningsprojektets översiktssida listar Swedish; andelen översatt tolkades ur sidans HTML till cirka 38 % och är osäker. Källa: https://translate.phplist.org/projects/phplist/
- **Automation.** README beskriver schemaläggning, upprepning och RSS-feeds men ingen automatiserad välkomstserie. OVERIFIERAT.
- **Bedömning.** Äldst arkitektur av de levande kandidaterna (PHP, cron, bounce via POP3). Inget som slår listmonk eller Keila på kravbilden.

### Mailtrain

- **Licens, status.** [P] README på `master`: "Mailtrain v1 has been deprecated. It contains security flaws which won't likely be fixed." V2-grenen: GPL-V3.0, Node.js 14+, MySQL 8+/MariaDB 10+, rekommenderat minimum 2 vCPU och 4096 MB RAM, Docker-stack med Mailtrain, MongoDB, Redis och MariaDB. Docker Hub-taggen `latest` uppdaterades senast 2021-07-26. Senaste commit: OVERIFIERAT (GitHub gav 403), men paketdatumet pekar på att projektet inte levererat på flera år. Källa: https://raw.githubusercontent.com/Mailtrain-org/mailtrain/master/README.md, https://raw.githubusercontent.com/Mailtrain-org/mailtrain/v2/README.md, https://hub.docker.com/v2/repositories/mailtrain/mailtrain/tags
- **Funktioner (v2).** [P] Listor, segment, mallar inklusive MJML, "Automation (triggered and RSS campaigns)", inbyggd Zone-MTA. Dubbel opt-in, API och bounce: OVERIFIERAT (inte genomgångna). Källa: v2/README.md
- **Bedömning.** Utesluts på underhållsstatus och att den inbyggda MTA:n förutsätter egen IP.

### Sendy (inte öppen källkod)

- **Licens.** [P] Kommersiell produkt: "Each license is valid for installation on one domain", licensnyckel och domänbyte via kontaktformulär, "one-time payment model". Det är **inte öppen källkod**. Officiellt licenspris står inte på de sidor som lästes (en användarcitat nämner 69 USD): OVERIFIERAT. Om källkoden är läsbar för köpare är OVERIFIERAT. Källa: https://sendy.co/
- **Funktioner.** [P] Version 7.1.7; PHP och MySQL/MariaDB; Amazon SES (Sendys egen sida anger 1,6 USD per 10 000 mejl; det stämmer inte med SES-prissidans 0,10 USD per 1 000 och är ett äldre eller annorlunda antagande: OVERIFIERAT vilket som gäller) eller SMTP-leverantörer; dra-och-släpp-, WYSIWYG- och HTML-editor; **autoresponders** (drip-serier); enkel/dubbel opt-in; API där `POST /subscribe` "adds a new subscriber ... You can also use this method to update an existing subscriber"; bounce- och klagomålshantering via SES; Rules & Webhooks (utgående). Svenskt gränssnitt och egna typsnitt: OVERIFIERAT. Källa: https://sendy.co/, https://sendy.co/api
- **Bedömning.** Funktionsmässigt närmast kravbilden (editor, serie, DOI, upsert) men inte öppen källkod, och SES-beroende. Tas med bara som referens.

### Postal

- **Typ och licens.** [P] "A complete and fully featured mail server ... Think Sendgrid, Mailgun or Postmark but open source". FAQ: "Postal is a mail transport agent and not a mailing list manager. We don't want to add features ... for example, address books or handling the un-subscription of people." Licensfil hittades inte på de sökvägar som testades (`LICENSE`, `LICENSE.md`, `LICENSE.txt`, `MIT-LICENSE`, `COPYING`): **OVERIFIERAT.** Källa: https://raw.githubusercontent.com/postalserver/postal/main/README.md, https://docs.postalserver.io/welcome/faqs
- **Underhåll.** [P] Version 3.3.7 (2026-06-03: SSRF- och SQL-injektionsfixar), 3.3.6 (2026-04-28). Källa: https://raw.githubusercontent.com/postalserver/postal/main/CHANGELOG.md
- **Drift.** [P] "We strongly recommend installing Postal on its own dedicated server", minst 4 GB RAM, 2 kärnor, 25 GB disk, MariaDB 10.6+, Docker, och leverantören får inte blockera utgående port 25. "If you use Postal, you will be responsible for configuring your DNS as well as maintaining the platform." Källa: https://docs.postalserver.io/getting-started/prerequisites, https://docs.postalserver.io/getting-started
- **Leverans.** [P] FAQ: konfigurera rDNS/PTR, DKIM, SPF, kontrollera blocklistor; "New IPs sending large volumes of e-mail will likely not deliver well initially." Källa: https://docs.postalserver.io/welcome/faqs
- **Bedömning.** Löser inte problemet: det är själva mailservern, den vill ha egen server och egen IP, och den hanterar varken listor eller avanmälningar. Ett val bara för den som vill äga hela kedjan. Inte relevant för föreningens storlek.

### Dolibarr och övrigt

Dolibarr och andra ERP/CRM-verktyg med mejlmodul är inte undersökta; ingen primärkälla hämtades och inget tyder på att de passar bättre än listmonk eller Keila för det här behovet. OVERIFIERAT.

## Kärnfråga 1: Leveransbarhet vid självhosting

**Vad Google kräver [P]** (https://support.google.com/mail/answer/81126, hämtad 2026-11-03):

- Alla avsändare: SPF eller DKIM; sändande domäner eller IP:n ska ha giltiga forward- och reverse-DNS-poster (PTR), där IP:n i PTR-posten måste matcha värdnamnets A/AAAA-post; TLS; imitera inte Gmails `From:`; spamfrekvens i Postmaster Tools under 0,10 %, aldrig 0,30 % eller mer. DKIM-nyckel på minst 1 024 bitar för personliga Gmail-konton, 2 048 rekommenderas.
- Över 5 000 meddelanden per dag till Gmail: SPF och DKIM, DMARC (policy får vara `none`), `From`-domänen justerad mot SPF- eller DKIM-domänen, ett-klicks-avanmälan (`List-Unsubscribe-Post: List-Unsubscribe=One-Click` plus `List-Unsubscribe`) för marknadsförings- och prenumerationsmejl, och synlig avanmälningslänk.
- Delad IP: reputation delas med alla som använder IP:n; kontrollera blocklistor. Gmail spårar volym och gränser per domän och per IP, och IP-kvoten delas av alla avsändare på IP:n.

**Vad Yahoo kräver [P]** (https://senders.yahooinc.com/best-practices/, https://senders.yahooinc.com/faqs/):

- Alla avsändare: SPF eller DKIM, spamfrekvens under 0,3 %, giltig forward- och reverse-DNS för sändande IP, RFC 5321/5322.
- Bulk-avsändare (definieras som "a significant volume of mail", ingen tröskel anges): SPF och DKIM, DMARC minst `p=none`, justerad `From`-domän, fungerande `List-Unsubscribe` med ett-klicks-avanmälan (RFC 8058 starkt rekommenderat) för marknadsföring, synlig länk, avanmälan behandlad inom 2 dagar.
- PTR: "Publish valid, meaningful, non-generic reverse DNS (PTR) records for all of your sending IPs"; utan den är det mer sannolikt att IP:ns rykte nedgraderas.

**Egen IP mot relä (slutsats av källorna):**

- Vid ~några hundra mottagare faller föreningen under Googles formella 5 000-gräns, men grundkraven (SPF eller DKIM, TLS, PTR) gäller alla och Yahoo anger ingen volymgräns. Alla relevanta öppna verktyg kan sätta `List-Unsubscribe` (listmonk, phpList och Keila belagda i kod/ändringslogg), så avanmälningskraven går att uppfylla oavsett.
- Egen IP betyder att föreningen själv ansvarar för PTR, rDNS som matchar HELO, blocklistor, uppvärmning och komplettering av IP:ns historik (Postals FAQ). Dessutom blockerar **Hetzner port 25 och 465 på alla molnservrar**; de kan låsas upp "once you have been with us for a month and paid your first invoice" efter ansökan, och port 587 är öppen för externa leveranstjänster [P] (https://docs.hetzner.com/cloud/servers/faq/). Scaleways, UpClouds och andras port 25-policy är inte läst: OVERIFIERAT.
- Via ett relä skickar föreningen från leverantörens IP-poolar och reputation, och verktyget behöver bara SMTP-uppgifter. Det som kvarstår hos föreningen är domänautentiseringen (SPF/DKIM/DMARC på den egna domänen) och att hålla listorna rena.
- **Rekommendation om källorna stöder den (egen slutsats):** relä, inte egen IP. EU-alternativ som källorna stöder:
  - **Amazon SES i Europa (Stockholm, `eu-north-1`)**. SMTP-endpoint `email-smtp.eu-north-1.amazonaws.com` finns [P] (https://docs.aws.amazon.com/general/latest/gr/ses.html). Nya konton startar i *sandbox* (bara verifierade mottagare) tills man ansöker om produktionsåtkomst, per region [P] (https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html). Det är det relä som listmonk, Keila och Mautic alla har dokumenterad bounce-hantering för. AWS är dock ett amerikanskt bolag; se GDPR-avsnittet.
  - **Brevo SMTP**. Brevo skriver att relävägen ger marknadsförings- och transaktionsmejl, att reläservrarna "do not store any of the data; they simply pass it on to our data centers in Europe" [P] (https://help.brevo.com/hc/en-us/articles/360001005870-SMTP-relay, https://help.brevo.com/hc/en-us/articles/209462765-What-is-Brevo-SMTP, lästa via Brevos hjälpcenter-API). Gratisplanen har 300 mejl per dag (grannfilen). Bounce-mottagning från Brevo till listmonk/Keila/Mautic är inte dokumenterad: OVERIFIERAT.
  - **Mailgun med EU-region**. EU-endpoints (`api.eu.mailgun.net`, `smtp.eu.mailgun.org`) finns [P] (https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview/); gratis 100 mejl per dag, Basic 15 USD/mån med 10 000 mejl [P] (https://www.mailgun.com/pricing/). Mailguns DPA/hosting är inte läst: OVERIFIERAT. Keila har Mailgun-stöd med EU-endpoint.
  - **Går inte:** Scaleway TEM (endast transaktionsmejl, "Can I send marketing emails with TEM? No." [P], https://www.scaleway.com/en/transactional-email-tem/); Postmark (primära data och servrar i USA, "We currently don't have plans to add servers in the EU" [P], https://postmarkapp.com/eu-privacy).

## Kärnfråga 2: Driftbörda och kostnad

**VPS i EU (priser från leverantörernas egna sidor, 2026-11-03, exkl. moms om inget annat sägs).** Sidorna visar också text om tillgänglighet som jag redovisar utan att tolka.

| Leverantör | Typ | Specifikation | Pris | Källa |
| --- | --- | --- | --- | --- |
| Hetzner | CX23 (kostnadsoptimerad) | 2 vCPU, 4 GB RAM, 40 GB NVMe | 5,99 EUR/mån (sidan skriver "not available" vid raden) | https://www.hetzner.com/cloud/cost-optimized/ |
| Hetzner | CAX11 (Ampere/ARM) | 2 vCPU, 4 GB, 40 GB | 6,49 EUR/mån (samma anmärkning) | samma |
| Hetzner | CPX02 (Regular Performance, ny) | 1 vCPU, 1 GB, 20 GB | 6,49 EUR/mån; sidan skriver "currently unavailable" | https://www.hetzner.com/cloud/regular-performance/ |
| Hetzner | CPX12 | 1 vCPU, 2 GB, 40 GB | 11,99 EUR/mån | samma |
| Hetzner | CPX22 | 2 vCPU, 4 GB, 80 GB | 19,99 EUR/mån | samma |
| Scaleway | PLAY2-PICO | 1 vCPU, 2 GB | ca 10,42 EUR/mån ("Prices before tax"; lokal lagring och publik IPv4 ingår inte) | https://www.scaleway.com/en/pricing/virtual-instances/ |
| Scaleway | BASIC2-A2C-4G | 2 vCPU, 4 GB | ca 16,79 EUR/mån (samma förbehåll) | samma |
| UpCloud | - | - | OVERIFIERAT (sidan gav 403) | - |

Hetzners datacenter för molnservrar i listan: FSN1, NBG1 (Tyskland) och HEL1 (Finland) [P] (https://www.hetzner.com/cloud/regular-performance/). Scaleways zon i prissidan: PAR-1 (Paris) [P]. Säkerhetskopior: Hetzner erbjuder dagliga backuper med sju platser per server [P] (https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/); backuppriset står bara på prissidans infobox och lästes inte: OVERIFIERAT. En `pg_dump` till extern lagring kostar inget i sig men måste skötas.

**Relä (per månad):**

| Relä | Pris | Källa |
| --- | --- | --- |
| Amazon SES, à la carte | 0,10 USD per 1 000 mejl; nya konton startar enligt prissidan på planen Essentials från 2026-07-21 med 0,16 USD per 1 000, ingen månadsavgift för Essentials | https://aws.amazon.com/ses/pricing/ |
| Brevo SMTP (gratisplan) | 0 (300 mejl/dag, Brevo-logga enligt grannfilen) | grannfilen, Brevo-avsnittet |
| Mailgun | Free 0 (100 mejl/dag), Basic från 15 USD (10 000 mejl/mån) | https://www.mailgun.com/pricing/ |
| Scaleway TEM | Går inte (endast transaktionsmejl) | se ovan |

**Räkneexempel (egen uträkning, inte från någon källa):** 500 mottagare, 4 utskick per månad = 2 000 mejl. SES: 0,20 till 0,32 USD per månad. Då blir egen drift ungefär VPS 6 EUR plus en slant, runt **6-7 EUR/månad exkl. moms**, plus backup (OVERIFIERAT pris).

**Jämförelse med SaaS (pris från grannfilen, ej omhämtat):** Brevo Free 0 (Brevo-logga, 300 mejl/dag), Brevo Standard från 18 USD/mån, MailerLite Comfort 11 EUR/mån vid 500 prenumeranter (10,80 USD, 20 % lägre vid årsbetalning), 30 % rabatt för ideella.

**Slutsats om pengarna:** infrastrukturkostnaden är jämförbar med eller något lägre än betalda SaaS-planer, men Brevo Free är gratis. Egen drift sparar alltså inga pengar. Det den kostar är arbetstid. Någon källa som mäter tidsåtgång finns inte: OVERIFIERAT.

**Vem driftar, uppdaterar, säkerhetskopierar?** Bara föreningen. Det som källorna säger föreningen måste göra:

- Installera och uppdatera OS, Docker och programmet. listmonk: byt binär eller `docker compose pull`, kör `--upgrade`, och "Always take a backup of the Postgres database before upgrading" [P]. Keila: ändringslogg 0.40.1 säger att uppdatering rekommenderas efter säkerhetsfixar för lagrad XSS [P]. Mautic: månatliga patchversioner och cron-jobb [P]. Postal: "you will be responsible for ... maintaining the platform (including running upgrades)" [P].
- Ta och testa backup av databasen. Ingen av projektens dokumentation anger en inbyggd backuprutin; listmonk hänvisar till Postgres-backup.
- Bevaka domänautentisering, bounce-/klagomålsflöden och spamfrekvens (Google: aldrig 0,30 %).
- Någon behöver ta emot larm och agera vid personuppgiftsincident (GDPR art. 33: anmälan till tillsynsmyndigheten senast 72 timmar efter att ha fått vetskap om den [P]).
- Driften av mellanledet för Repejo (kärnfråga 4) tillkommer: en egen liten tjänst som också behöver drift.

## Kärnfråga 3: GDPR när föreningen driftar själv

Endast vad primärkällorna säger. Inga juridiska slutsatser. Se grannfilen för samtycke, marknadsföringslagen och IMY.

- **Biträdesbilden ändras.** GDPR art. 28.1: den personuppgiftsansvarige ska "endast anlita personuppgiftsbiträden som ger tillräckliga garantier"; art. 28.3: behandlingen ska regleras genom avtal med föremål, varaktighet, art, ändamål, typ av uppgifter och kategorier av registrerade, och art. 28.2: biträdet får inte anlita underbiträde utan skriftligt förhandstillstånd [P] (https://publications.europa.eu/resource/cellar/3e485e15-11bd-11e6-ba9a-01aa75ed71a1.0024.03/DOC_1).
- **Vem blir biträde vid egen drift (beskrivning):** VPS-leverantören (Hetzner, Scaleway, UpCloud m.fl.) lagrar databasen med e-postadresserna; reläleverantören (SES, Brevo, Mailgun m.fl.) ser adress och innehåll i varje utskick. Programvaran (listmonk, Keila) är inget biträde: den körs hos föreningen. I SaaS-fallet är det i stället e-posttjänsten som är det enda biträdet utöver Repejo (grannfilen).
- **Lästa avtalsunderlag:**
  - Hetzner: sidan `hetzner.com/legal/data-processing/` hämtades men textutdraget gav bara bolagsuppgifter; innehållet i personuppgiftsbiträdesavtalet är OVERIFIERAT.
  - AWS: "AWS GDPR Data Processing Addendum" finns och omfattar kundinnehåll; AWS skriver att kunddata "stays in the AWS Region you select" med undantag för tjänster där överföring är en del av tjänsten, och att AWS är både biträde och personuppgiftsansvarig i vissa situationer [P] (https://aws.amazon.com/compliance/eu-data-protection/, https://aws.amazon.com/compliance/gdpr-center/). Hur det gäller SES specifikt, och vilka uppgifter AWS behandlar som egen ansvarig, har jag inte läst: OVERIFIERAT.
  - Brevo: DPA ingår i användarvillkoren, infrastruktur hos OVH (Frankrike) och Google Cloud (Belgien) (grannfilen, [P]).
  - Postmark: servrar och primära data i USA, "GDPR does not require physical servers in the EU" som leverantörens egen formulering [P] (https://postmarkapp.com/eu-privacy).
  - Mailgun, Scaleway (TEM används inte): DPA/hosting är inte läst eller inte relevant.
- **Säkerhet.** GDPR art. 32 kräver lämpliga tekniska och organisatoriska åtgärder, inklusive kryptering och "förmågan att återställa tillgängligheten och tillgången till personuppgifter i rimlig tid" samt regelbunden testning [P]; art. 33: anmälan av personuppgiftsincident till tillsynsmyndigheten senast 72 timmar, och biträdet ska underrätta den ansvarige "utan onödigt dröjsmål" [P] (samma källa). Med egen drift är föreningen den som ska visa att åtgärderna finns.
- **Spårning.** listmonk beskriver öppnings- och klickspårning som något som "carries privacy implications and should be used in compliance with ... GDPR" och att det går att spåra anonymt [P] (https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/concepts.md). Att stänga av spårning bör bestämmas i förväg (föreningens beslut).

## Kärnfråga 4: Hur passar Repejo-kopplingen

Det som grannfilen redan belagt (https://app.repejo.se/docs/api-webhooks): Repejo skickar `{ sent_at, event_type, data }` med e-post under `data`, signerar råa bodyn med HMAC-SHA256 i `Repejo-Signature: sha256=<hex>`, kräver 2xx-svar, försöker upp till 20 gånger över ungefär tolv dygn och kan skicka dubbletter och i fel ordning (filtrera på `X-Repejo-Event-ID`). `contact_consent` är en boolean utan tidpunkt. Planbehovet (om webhooks kräver API-tillvalet 959 kr/mån) är OVERIFIERAT.

**Kan någon kandidat ta emot anropet direkt?** Nej, enligt det som lästes:

| Verktyg | Inkommande anrop | Räcker det för Repejo? |
| --- | --- | --- |
| listmonk | API med basic auth/token för skapa-prenumerant; webhook-endpoints finns bara för bounces från namngivna leverantörer | Nej: ingen HMAC-kontroll av `Repejo-Signature`, och Repejos nästlade payload är inte i listmonks format |
| Keila | API med nycklar, formulärinlämning `POST /api/v1/forms/{id}/actions/submit` | Nej: kräver ändå mellanled för signatur, deduplicering och mappning |
| Mautic | REST-API (OAuth/basic), formulär; ingen generisk inkommande webhook hittad | Nej (OVERIFIERAT att ingen finns) |
| phpList, Mailtrain, Sendy | Egna API:er; ingen dokumenterad Repejo-kompatibel webhook | Nej/OVERIFIERAT |

Slutsats (egen, bygger på grannfilens avsnitt "Tre sätt att ta emot Repejos anrop"): **ett mellanled behövs oavsett val.** Det ska kontrollera signaturen på råa bodyn, svara 2xx snabbt, vara idempotent på `X-Repejo-Event-ID`, bara föra vidare e-post och medgivande, inte logga personnummer, och logga tidpunkt/event-id/checkout-id som underlag för medgivande (GDPR art. 7.1, grannfilen). Vid egenhostat verktyg kan mellanledet köras som en liten tjänst bredvid verktyget (mer drift) eller som en extern serverless-funktion (som i SaaS-fallet). Därefter:

- **listmonk:** funktionen anropar `POST /api/subscribers` (eller `/api/public/subscription`) med en dubbel opt-in-lista; utan `preconfirm_subscriptions` skickas bekräftelsemejlet. Första välkomstmejlet kan skickas med `POST /api/tx`. En serie över tid kräver att funktionen schemalägger (egen slutsats).
- **Keila:** funktionen anropar formulärets submit-endpoint, vilket startar dubbel opt-in; välkomstmejlet i formuläret är första onboardingmejlet.
- **Mautic:** funktionen skapar kontakten (`POST /contacts/new`) och lägger den i ett segment som är ingång till en kampanj; DOI måste byggas separat.

Eftersom `contact_consent` bara är en boolean utan ämne gäller grannfilens slutsats: lägg inte alla nya faddrar i prenumerationslistan, utan lägg dem i en separat lista med dubbel opt-in eller vänta på formulärprenumeration. Det är verktygsoberoende.

## Rekommendation och villkor

**Rekommendation (egen slutsats):** för en förening med några hundra mottagare, icke-tekniska redaktörer och GDPR som tungt skäl är **SaaS fortsatt det rimligaste valet** (Brevo enligt grannfilen), och egen drift förtjänar att övervägas bara om villkoren nedan är uppfyllda. Pengarna talar inte för egen drift: VPS (ca 6 EUR/mån) och SES/Brevo-relä kostar ungefär lika mycket som MailerLite Comfort och mer än Brevo Free (0). Skälen mot egen drift är dels att föreningen blir ansvarig för patchning, backup, incidenter och domänautentisering (kärnfråga 2 och 3), dels att ingen av de öppna kandidaterna dokumenterar en onboarding-serie utan eget schemaläggande mellanled (kärnfråga 4), dels att Repejo-mellanledet behövs ändå.

**Om föreningen ändå väljer egen drift:**

1. Verktyg: **listmonk** om en stabil, mogen kodbas och ett svenskt gränssnitt väger tyngst; **Keila** om redaktörernas editor och inbyggda DOI-/välkomstmejl väger tyngst och föreningen accepterar före-1.0-versioner. Båda är AGPL-3.0.
2. Relä, inte egen IP: **Amazon SES i Stockholm** (bounce-hantering dokumenterad i listmonk, Keila och Mautic) eller **Brevo SMTP** (reläserver som vidarebefordrar till europeiska datacenter). Ansök om SES produktionsåtkomst i tid.
3. Mellanled för Repejo som beskrivet.
4. Någon namngiven person (inte "styrelsen") äger uppdateringar och backup.

**Villkor som skulle ändra svaret:**

- *Mot egen drift (stärker SaaS):* ingen person i föreningen vill eller kan åta sig löpande drift och incidentberedskap; föreningen vill ha en flerstegs onboarding-serie utan eget kodande; Repejo-tillvalet (959 kr/mån) visar sig behövas för webhooken, vilket gör mellanledet dyrare än e-posttjänsten.
- *För egen drift:* en volontär med serverkunskap åtar sig driften skriftligt; föreningen vill ha all data på egen server hos en leverantör med personuppgiftsbiträdesavtal som den litar på; Brevos engelska gränssnitt visar sig vara ett hinder för redaktörerna (listmonk och Keila finns på svenska); Brevo Free-gränsen (300 mejl/dag, loggan) eller automationsgränsen på 2 000 kontakter (grannfilen) blir ett problem.
- *Om serie krävs:* Mautic är då det enda öppna verktyget med dokumenterad kampanjautomation och egna typsnitt i editorn, men kräver tyngre drift (PHP 8.2+, MySQL 8.4+, cron) och saknar dokumenterad DOI. Sendy har autoresponders och DOI men är inte öppen källkod.
- *Om Repejos egna tack-mejl räcker som onboarding* (grannfilen): behovet av serieautomation försvinner och listmonk/Keila blir mer attraktiva.

## Öppna frågor och risker

Status: **Besvarad**, **Delvis besvarad** eller **Öppen**.

1. **Underhållsstatus från GitHub. Delvis besvarad.** GitHubs API och releasesidor gav 403. Release- och aktivitetsdatum kommer från Docker Hub-taggar, Packagist, projektens ändringsloggar och webbsidor. Senaste commit per projekt är inte läst. Kräver `gh`/GitHub-åtkomst till respektive repo eller manuell kontroll.
2. **UpCloud. Öppen.** Prissidan gav 403.
3. **Postals licens. Öppen.** Ingen licensfil hittades på testade sökvägar.
4. **Sendy. Delvis besvarad.** Officiellt licenspris, källkodstillgång och svenskt gränssnitt är OVERIFIERADE.
5. **listmonk: upsert och byggare. Delvis besvarad.** Upsert på e-post i ett anrop är OVERIFIERAT; om den visuella dra-och-släpp-byggaren finns i stabil 6.2.0 är OVERIFIERAT (webbplatsen beskriver den; senaste utgåva är 7.0.0-beta.1).
6. **Egna typsnitt. Delvis besvarad.** Belagt endast för Mautic (`editor_fonts`). listmonk och Keila har HTML-mallar som tekniskt tillåter `@font-face`, men det är inte dokumenterat. Gmails webbgränssnitt stöder inte alla webbtypsnitt (grannfilen), så fallback behövs oavsett verktyg.
7. **Mautic: DOI. Öppen.** Ingen inbyggd dubbel opt-in dokumenterad; tillägg ej undersökta.
8. **Bounce-mottagning från Brevo och Mailgun till verktygen. Öppen.** listmonk listar inte Brevo eller Mailgun bland bounce-webhooks; Keila nämner bara SES; Mautic listar Mailjet, SendGrid, SES m.fl. men inte Brevo/Mailgun.
9. **Relä-DPA:er. Delvis besvarad.** AWS och Brevo: källor lästa. Mailgun: ej läst. Hetzners biträdesavtal: ej läst. Underbiträden per leverantör kräver avtalsläsning vid val.
10. **Backup-pris och tidsåtgång. Öppen.** Hetzner-backuppriset och realistisk månadstid för drift saknas i primärkällor.
11. **Repejo. Delvis besvarad.** Oförändrade öppna punkter från grannfilen (planbehov för webhook, innebörden av `contact_consent`, medgivandets tidpunkt, biträdesavtal).
12. **Microsofts avsändarkrav. Öppen.** Inte hämtade; grannfilen och Google/Yahoo är de enda lästa kraven.
13. **Juridik. Öppen.** Inga juridiska slutsatser dras här; se grannfilens avsnitt om marknadsföringslagen och onboarding-mejl.
