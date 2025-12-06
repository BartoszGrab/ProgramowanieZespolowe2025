# Używamy oficjalnego obrazu .NET SDK do budowania aplikacji
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Kopiujemy plik projektu i pobieramy biblioteki (restore)
COPY *.csproj ./
# ZMIANA 1: Wskazujemy konkretny plik .csproj
RUN dotnet restore backend.csproj

# Kopiujemy resztę plików i budujemy aplikację
COPY . ./
# ZMIANA 2: Wskazujemy konkretny plik .csproj przy publikacji
RUN dotnet publish backend.csproj -c Release -o out

# Tworzymy ostateczny obraz uruchomieniowy (lżejszy)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Wystawiamy port
EXPOSE 8080

# Komenda startowa
ENTRYPOINT ["dotnet", "backend.dll"]