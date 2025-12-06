FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY *.csproj ./

RUN dotnet restore backend.csproj


COPY . ./

RUN dotnet publish backend.csproj -c Release -o out


FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .


EXPOSE 8080

ENTRYPOINT ["dotnet", "backend.dll"]