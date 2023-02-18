# SecurePi

Ovdje možete naći izvorni kôd stranice sustava SecurePi.

### Što je SecurePi?
**SecurePi je sustav za nadzor objekta**. Sastoji se od fizičkog dijela (kutija koja je oslanja na vrata u kojoj se nalaze infracrvena kamera, PIR (pasivni infracrveni senzor), eksperimentalna pločica i Raspberry Pi) i programskog dijela (kôd stranice i kôd koji se pokreče na Raspberryu). Korisnik preko stranice može gledati što se to zapravo događa ispred njegovih vrata i primati notifikacije na svim povezanim uređajima pri detekciji pokreta.

### U čemu je SecurePi napravljen?
Stranica je napravljena u okruženju Next.js (React.js + Typescript). *Hosting* stranice, online baza podataka, autentifikacija korisnika 
Izvorni se kôd ne može pokrečati putem npm-a, kako biste mogli posjetiti stranicu sustava SecurePi morate ići na [sljedeću poveznicu](https://sccure-pi.web.app). UI stranice je večinom napravljen koristeći Shards React, knjižnica komponenti za React.js. 
Kôd koji se pokreče na Raspberryu koristi programski jezik Python s modulima Firebase (dohvačanje korisničkih podataka), OpenCV (snimanje video prijenosa infracrvene kamere) i GPIO (za prepoznavanje osobe putem PIR senzora).

### Razvoj SecurePia

Svibanj 2022. - posudba Raspberry Pia i brainstorming ideje
 
Lipanj 2022. - početak razvoja stranice, prva ideja za kutiju, raspitivanje i Crypto Intership u splitskoj softverskoj tvrtci *Blank*

Rujan 2022. - ponovni razvoj stranice (prva stranica je koristila knjižnicu komponenti Bootstrap s kojom nisam bio zadovoljan)

Listopad 2022. - finaliziran izgled stranice

Studeni 2022. - prikupljanje potrebnih dijelova za kutiju

Prosinac 2022. - razvoj stranice

Siječanj 2023. - zadnji prototip i razvoj stranice (korisnički račun)

Veljača 2023. - finalizacija kutije i stranice

### Dokumentacija
Dokumentacija se može naći na [sljedećoj poveznici](https://pdfhost.io/v/Tozimw~w6_Tehnika_Dokumentacija_SecurePi).

###### © Tonči Crljen 2023
