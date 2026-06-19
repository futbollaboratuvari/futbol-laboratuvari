# Launcher ve Masaustu Kisayol Raporu

## Robot Giris Dosyasi

Robot ana giris dosyasi:

```text
src\robot.py
```

## Launcher Dosyasi

Windows launcher dosyasi:

```text
run_robot.bat
```

Launcher davranisi:

- Proje klasorune otomatik gecer.
- `outputs` ve `data` klasorleri yoksa olusturur.
- Once `.venv`, sonra `venv`, sonra Codex paketli Python yolunu dener.
- Windows Store Python alias'ina takilmamak icin sistem `python` komutunu sadece `python --version` basariliysa kullanir.
- API key yoksa demo modda devam eder.
- Hata olursa pencereyi kapatmadan mesaj gosterir.
- Robot bitince `outputs\bugunun_en_guclu_maclari.md` raporunu Notepad ile otomatik acar.

## Masaustu Kisayolu

Olusturulan kisayol:

```text
C:\Users\Arıf\OneDrive\Desktop\Futbol Laboratuvari Robot.lnk
```

Kisayol hedefi:

```text
C:\Windows\System32\cmd.exe
```

Kisayol argumani:

```text
/k "C:\Users\Arıf\Documents\Codex\2026-06-18\bu-klas-r-i-in-basit\run_robot.bat"
```

Calisma klasoru:

```text
C:\Users\Arıf\Documents\Codex\2026-06-18\bu-klas-r-i-in-basit
```

## Cift Tik Davranisi

Masaustundeki `Futbol Laboratuvari Robot` kisayoluna cift tiklaninca CMD acilir, `run_robot.bat` calisir ve robot `src\robot.py` dosyasindan baslar.

Robot tamamlaninca rapor Notepad'de acilir. CMD `/k` ile acildigi icin hata olsa bile pencere hemen kapanmaz.

## Test Sonucu

`run_robot.bat` test edildi ve robot demo modda basladi.

Son duzeltme:

- Masaustunden calistirma sirasinda Windows `python` alias'i "Python bulunamadi" hatasi veriyordu.
- Launcher artik bu alias'i kullanmadan once gercek Python olup olmadigini test ediyor.
- Codex paketli Python yolu PATH'ten once denendigi icin masaustu kisayolu robotu baslatabiliyor.

Not:

Robot calisirken dosya yazma tarafinda mevcut `Bad file descriptor` uyarilari gorulebiliyor. Bu launcher sorunu degildir; robotun mevcut dosya yazma davranisindan kaynaklanir.
