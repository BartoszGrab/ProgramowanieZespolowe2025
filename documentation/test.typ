= Raport z Testów

Przeprowadzono automatyczne testy jednostkowe warstwy Backendowej aplikacji. Celem testów była weryfikacja poprawności działania kluczowych komponentów systemu oraz zapewnienie stabilności wprowadzanych zmian.

== Podsumowanie Wykonania
- *Data wykonania*: #datetime.today().display("[day].[month].[year]")
- *Liczba testów*: 22
- *Status*: #text(fill: green, weight: "bold")[Wszystkie testy zaliczone (Passed)]
- *Technologie testowe*: xUnit, Moq, EF Core InMemory, MockQueryable

== Zakres i Pokrycie Testami

Testy jednostkowe objęły zarówno warstwę serwisów (logika biznesowa, integracje), jak i warstwę kontrolerów (obsługa żądań HTTP, autoryzacja).

#figure(
  table(
    columns: (auto, 1fr),
    inset: 10pt,
    align: (x, y) => if x == 0 { left } else { left },
    fill: (col, row) => if row == 0 { luma(240) } else { white },
    [*Komponent*], [*Weryfikowane Scenariusze*],
    [GoogleBooksService],
    [Poprawność budowania zapytań do API Google, parsowanie odpowiedzi JSON, obsługa błędów sieciowych.],

    [JwtService],
    [Generowanie tokenów bezpieczeństwa, poprawność zawartych roszczeń (Claims), konfiguracja klucza szyfrującego.],

    [ShelvesController],
    [Tworzenie nowych półek, walidacja unikalności nazw, dodawanie i usuwanie książek, zapewnienie izolacji danych między użytkownikami.],

    [AuthController],
    [Proces logowania (poprawne i błędne dane), obsługa błędów walidacji, symulacja zachowań menedżera tożsamości (Identity).],

    [ReviewsController], [Dodawanie nowych recenzji, edycja istniejących, blokada edycji cudzych recenzji.],
    [RecommendationsController],
    [Integracja z mikroserwisem AI, cache'owanie wyników w bazie danych, obsługa niedostępności serwisu rekomendacji.],
  ),
  caption: [Szczegółowy zakres testów jednostkowych],
)

== Wnioski
System backendowy został pokryty testami w newralgicznych punktach. Zastosowanie bazy danych w pamięci (`InMemory`) pozwoliło na szybką weryfikację logiki bazodanowej bez konieczności utrzymywania zewnętrznej instancji PostgreSQL dla celów testowych. Architektura została dostosowana do testowalności poprzez wydzielenie interfejsów (np. `IBooksRecService`).
