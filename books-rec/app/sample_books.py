"""
Sample book database for demonstration.
Contains Polish and English books across various genres.
"""

from typing import List
from app.models import BookInDB
import uuid


def get_sample_books() -> List[BookInDB]:
    """Get sample books for initializing the vector database."""
    
    books = [
        # ========================
        # POLISH BOOKS - Fantasy
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="Wiedźmin: Ostatnie Życzenie",
            author="Andrzej Sapkowski",
            description="Zbiór opowiadań o Geralcie z Rivii, wiedźminie - profesjonalnym pogromcy potworów. Mroczne fantasy pełne moralnych dylematów.",
            genre="Fantasy",
            language="pl",
            tags=["wiedźmin", "dark fantasy", "polska literatura"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Wiedźmin: Miecz Przeznaczenia",
            author="Andrzej Sapkowski",
            description="Kontynuacja przygód Geralta. Opowiadania o miłości, przeznaczeniu i wyborach między mniejszym a większym złem.",
            genre="Fantasy",
            language="pl",
            tags=["wiedźmin", "dark fantasy", "polska literatura"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Narrenturm",
            author="Andrzej Sapkowski",
            description="Pierwsza część Trylogii Husyckiej. Historia Reinmara z Bielawy w czasach wojen husyckich, pełna magii i intryg.",
            genre="Fantasy",
            language="pl",
            tags=["historical fantasy", "husyci", "średniowiecze"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Pan Lodowego Ogrodu",
            author="Jarosław Grzędowicz",
            description="Vuko Drakkainen, agent wysłany na planetę Midgaard, odkrywa świat pełen magii i nordyckich legend. Mieszanka SF i fantasy.",
            genre="Fantasy",
            language="pl",
            tags=["science fantasy", "nordycka mitologia", "polska literatura"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Achaja",
            author="Andrzej Ziemiański",
            description="Niewolnica Achaja wyrusza na wojnę z cesarstwem. Epicka saga o sile charakteru i determinacji.",
            genre="Fantasy",
            language="pl",
            tags=["epic fantasy", "wojenne", "polska literatura"]
        ),
        
        # ========================
        # POLISH BOOKS - Sci-Fi  
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="Solaris",
            author="Stanisław Lem",
            description="Naukowcy badający oceaniczną planetę Solaris zmagają się z kontaktem z obcą inteligencją, która materializuje ich najskrytsze wspomnienia.",
            genre="Sci-Fi",
            language="pl",
            tags=["hard sf", "filozofia", "polska literatura", "klasyka"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Cyberiada",
            author="Stanisław Lem",
            description="Przygody konstruktorów Trurla i Klapaucjusza - robotów budujących cudowne maszyny w humorystycznym uniwersum.",
            genre="Sci-Fi",
            language="pl",
            tags=["humor", "roboty", "polska literatura"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Niezwyciężony",
            author="Stanisław Lem",
            description="Załoga statku Niezwyciężony bada tajemniczą planetę Regis III i odkrywa przerażające formy mechanicznej ewolucji.",
            genre="Sci-Fi",
            language="pl",
            tags=["hard sf", "eksploracja", "polska literatura"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Diuna",
            author="Frank Herbert",
            description="Paul Atryda musi przetrwać na pustynnej planecie Arrakis, jedynym źródle melanżu - najcenniejszej substancji we wszechświecie.",
            genre="Sci-Fi",
            language="pl",
            tags=["space opera", "polityka", "ekologia"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Problem trzech ciał",
            author="Liu Cixin",
            description="Naukowcy odkrywają sygnały z obcej cywilizacji. Pierwszy tom nagradzanej trylogii Wspomnienie o przeszłości Ziemi.",
            genre="Sci-Fi",
            language="pl",
            tags=["hard sf", "pierwszy kontakt", "chińska literatura"]
        ),
        
        # ========================
        # POLISH BOOKS - Literary
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="Bieguni",
            author="Olga Tokarczuk",
            description="Powieść o podróżowaniu, nomadach i ciągłym ruchu. Nagroda Nobla 2018.",
            genre="Literary Fiction",
            language="pl",
            tags=["nobel", "podróże", "polska literatura"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Księgi Jakubowe",
            author="Olga Tokarczuk",
            description="Monumentalna opowieść o Jakubie Franku i jego ruchu religijnym w XVIII-wiecznej Polsce.",
            genre="Historical Fiction",
            language="pl",
            tags=["nobel", "historia", "religia"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Lalka",
            author="Bolesław Prus",
            description="Historia Stanisława Wokulskiego i jego obsesyjnej miłości do arystokratki Izabeli Łęckiej. Klasyka polskiego realizmu.",
            genre="Literary Fiction",
            language="pl",
            tags=["klasyka", "realizm", "XIX wiek"]
        ),
        
        # ========================
        # POLISH BOOKS - Thriller/Crime
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="Ziarno prawdy",
            author="Zygmunt Miłoszewski",
            description="Prokurator Teodor Szacki prowadzi śledztwo w Sandomierzu, gdzie zostaje znaleziony okaleczony trup.",
            genre="Thriller",
            language="pl",
            tags=["kryminał", "polska", "prokurator szacki"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Uwikłanie",
            author="Zygmunt Miłoszewski",
            description="Pierwszy tom serii o prokuratorze Szackim. Morderstwo podczas sesji terapeutycznej w Warszawie.",
            genre="Thriller",
            language="pl",
            tags=["kryminał", "warszawa", "psychologia"]
        ),
        
        # ========================
        # ENGLISH BOOKS - Fantasy
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Lord of the Rings",
            author="J.R.R. Tolkien",
            description="Frodo Baggins must destroy the One Ring to defeat the Dark Lord Sauron. The definitive epic fantasy.",
            genre="Fantasy",
            language="en",
            tags=["epic fantasy", "classic", "quest"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Hobbit",
            author="J.R.R. Tolkien",
            description="Bilbo Baggins joins a company of dwarves on an adventure to reclaim their homeland from a dragon.",
            genre="Fantasy",
            language="en",
            tags=["fantasy", "adventure", "classic"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="A Game of Thrones",
            author="George R.R. Martin",
            description="Noble families vie for control of the Iron Throne while an ancient evil awakens in the north.",
            genre="Fantasy",
            language="en",
            tags=["epic fantasy", "political intrigue", "dark fantasy"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Name of the Wind",
            author="Patrick Rothfuss",
            description="Kvothe tells the story of his life, from orphan to legendary figure, in this beautifully written fantasy.",
            genre="Fantasy",
            language="en",
            tags=["fantasy", "magic school", "first person"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Mistborn: The Final Empire",
            author="Brandon Sanderson",
            description="In a world of ash and mist, a street thief discovers she has magical powers and joins a rebellion.",
            genre="Fantasy",
            language="en",
            tags=["fantasy", "magic system", "heist"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Way of Kings",
            author="Brandon Sanderson",
            description="First book of the Stormlight Archive. Epic fantasy with detailed magic systems and world-building.",
            genre="Fantasy",
            language="en",
            tags=["epic fantasy", "magic system", "stormlight"]
        ),
        
        # ========================
        # ENGLISH BOOKS - Sci-Fi
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="Dune",
            author="Frank Herbert",
            description="Paul Atreides must survive on the desert planet Arrakis, the only source of the universe's most valuable substance.",
            genre="Sci-Fi",
            language="en",
            tags=["space opera", "politics", "ecology"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Foundation",
            author="Isaac Asimov",
            description="Hari Seldon predicts the fall of the Galactic Empire and creates the Foundation to preserve knowledge.",
            genre="Sci-Fi",
            language="en",
            tags=["space opera", "psychohistory", "classic"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Neuromancer",
            author="William Gibson",
            description="Case, a washed-up computer hacker, is hired for one last job in this groundbreaking cyberpunk novel.",
            genre="Sci-Fi",
            language="en",
            tags=["cyberpunk", "hacking", "AI"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Martian",
            author="Andy Weir",
            description="Astronaut Mark Watney is stranded on Mars and must use his ingenuity to survive.",
            genre="Sci-Fi",
            language="en",
            tags=["hard sf", "survival", "humor"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="Project Hail Mary",
            author="Andy Weir",
            description="An astronaut wakes up alone on a spaceship with no memory, tasked with saving humanity.",
            genre="Sci-Fi",
            language="en",
            tags=["hard sf", "space", "problem solving"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Three-Body Problem",
            author="Liu Cixin",
            description="Scientists discover signals from an alien civilization. First book of the Remembrance of Earth's Past trilogy.",
            genre="Sci-Fi",
            language="en",
            tags=["hard sf", "first contact", "chinese literature"]
        ),
        
        # ========================
        # ENGLISH BOOKS - Thriller
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="Gone Girl",
            author="Gillian Flynn",
            description="When Amy disappears on her wedding anniversary, suspicion falls on her husband Nick.",
            genre="Thriller",
            language="en",
            tags=["psychological thriller", "mystery", "marriage"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Girl with the Dragon Tattoo",
            author="Stieg Larsson",
            description="Journalist Mikael Blomkvist and hacker Lisbeth Salander investigate a decades-old disappearance.",
            genre="Thriller",
            language="en",
            tags=["mystery", "crime", "swedish"]
        ),
        
        # ========================
        # ENGLISH BOOKS - Horror
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="The Shining",
            author="Stephen King",
            description="Jack Torrance becomes the winter caretaker of the haunted Overlook Hotel with his family.",
            genre="Horror",
            language="en",
            tags=["horror", "haunted house", "psychological"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="It",
            author="Stephen King",
            description="The Losers Club confronts an ancient evil that takes the form of a terrifying clown in Derry, Maine.",
            genre="Horror",
            language="en",
            tags=["horror", "coming of age", "supernatural"]
        ),
        
        # ========================
        # POLISH BOOKS - Horror
        # ========================
        BookInDB(
            id=str(uuid.uuid4()),
            title="Lśnienie",
            author="Stephen King",
            description="Jack Torrance zostaje zimowym opiekunem nawiedzonego hotelu Overlook wraz z rodziną.",
            genre="Horror",
            language="pl",
            tags=["horror", "nawiedzony dom", "psychologiczny"]
        ),
        BookInDB(
            id=str(uuid.uuid4()),
            title="To",
            author="Stephen King",
            description="Klub Frajerów konfrontuje się z pradawnym złem, które przyjmuje postać przerażającego klauna w Derry.",
            genre="Horror",
            language="pl",
            tags=["horror", "dorastanie", "nadprzyrodzone"]
        ),
    ]
    
    return books


def get_sample_books_count() -> int:
    """Get count of sample books."""
    return len(get_sample_books())
