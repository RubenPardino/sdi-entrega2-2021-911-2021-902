package com.uniovi.tests;

//Paquetes Java
import java.util.List;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class SdiEntrega2Tests {
	// En Windows (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas)):
	// static String PathFirefox65 = "C:\\Program Files\\Mozilla
	// Firefox\\firefox.exe";
	// static String Geckdriver024 = "C:\\Path\\geckodriver024win64.exe";
	// En MACOSX (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas):
	// static String PathFirefox65 = "/Applications/Firefox
	// 2.app/Contents/MacOS/firefox-bin";
	// static String PathFirefox64 =
	// "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	// static String Geckdriver024 =
	// "/Users/delacal/Documents/SDI1718/firefox/geckodriver024mac";
	// static String Geckdriver022 =
	// "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	// Común a Windows y a MACOSX

	// static String PathFirefox65 = "C:\\Program Files\\Mozilla
	// Firefox\\firefox.exe";
	// static String Geckdriver024 =
	// "C:\\Users\\pardi\\OneDrive\\Escritorio\\SDI\\Sesion
	// 5\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
	static String PathFirefox65 = "C:\\Users\\jk236\\Desktop\\ff\\firefox.exe";
	static String Geckdriver024 = "C:\\Users\\jk236\\Downloads\\PL-SDI-Sesión5-material\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";

	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "https://localhost:8081";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	@BeforeClass
	static public void begin() {
		// COnfiguramos las pruebas.
		// Fijamos el timeout en cada opción de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR01. Registrarse con datos válidos /
	@Test
	public void PR01() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "testPrimerRegistro@gmail.com", "Jonathan", "Barbon", "123456", "123456");
		// Comprobamos que entramos en la sección privada
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Precio");
		assertTrue(elementos.get(0) != null);
	}

	// PR02. Registrarse con datos inválidos /
	@Test
	public void PR02() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "", "", "", "123456", "123456");
		// Comprobamos que NO entramos en la sección privada
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Email:");
		assertTrue(elementos.get(0) != null);
	}

	// PR03. Registrarse con repetición de contraseña inválida /
	@Test
	public void PR03() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "test2@gmail.com", "Jonathan", "Barbon", "123456", "654321");
		// Comprobamos que NO entramos en la sección privada
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Las contraseñas no coinciden");
		assertTrue(elementos.get(0) != null);
	}

	// PR04. Registrarse con usuario ya existente /
	@Test
	public void PR04() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "test1@gmail.com", "Jonathan", "Barbon", "123456", "123456");
		// Comprobamos que NO entramos en la sección privada
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Usuario ya registrado anteriormente");
		assertTrue(elementos.get(0) != null);
	}

	// PR05. Inicio de sesión con datos válidos /
	@Test
	public void PR05() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "testPrimerRegistro@gmail.com", "123456");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Precio");
		assertTrue(elementos.get(0) != null);
	}

	// PR06. Inicio de sesión con contraseña incorrecta /
	@Test
	public void PR06() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "testPrimerRegistro@gmail.com", "654321");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Email o password incorrecto");
		assertTrue(elementos.get(0) != null);
	}

	// PR07. Inicio de sesión con campos vacíos /
	@Test
	public void PR07() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "", "");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Email:");
		assertTrue(elementos.get(0) != null);
	}

	// PR08. Iniciar sesión con datos inválidos /
	@Test
	public void PR08() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "testNoExistente@gmail.com", "123456");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Email o password incorrecto");
		assertTrue(elementos.get(0) != null);
	}

	// PR09. Salir de sesión y comprobar que estás en el login /
	@Test
	public void PR09() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "1234");
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Email:");
		assertTrue(elementos.get(0) != null);
	}

	// PR10. Comprobar que no está el botón de desconectar /
	@Test
	public void PR10() {
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Desconectarse", PO_View.getTimeout());
	}

	// PR11. Mostrar el listado de usuarios al iniciar con la vista de administrador
	// /
	@Test
	public void PR11() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_View.checkElement(driver, "text", "prueba1@prueba1.com");
		PO_View.checkElement(driver, "text", "prueba10@test.com");
	}

	// PR12.Ir a la lista de usuarios, borrar el primer usuario de la lista,
	// comprobar que la lista se
	// actualiza y dicho usuario desaparece.
	@Test
	public void PR12() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"/html/body/div/div/div/table/tbody/tr/td[1]");
		int numElementosAnt = elementos.size();

		elementos = PO_View.checkElement(driver, "free", "//input[@type='checkbox']");
		elementos.get(0).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();

		elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/div/table/tbody/tr/td[1]");
		int numElementos = elementos.size();

		SeleniumUtils.esperarSegundos(driver, 10);
		assertEquals(numElementosAnt - 1, numElementos);
	}

	// PR13. Ir a la lista de usuarios, borrar el último usuario de la lista,
	// comprobar que la lista se
	// actualiza y dicho usuario desaparece
	@Test
	public void PR13() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"/html/body/div/div/div/table/tbody/tr/td[1]");
		int numElementosAnt = elementos.size();

		elementos = PO_View.checkElement(driver, "free", "//input[@type='checkbox']");
		elementos.get(elementos.size() - 1).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();

		elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/div/table/tbody/tr/td[1]");
		int numElementos = elementos.size();

		SeleniumUtils.esperarSegundos(driver, 10);
		assertEquals(numElementosAnt - 1, numElementos);
	}

	// PR14. Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se
	// actualiza y dichos
	// usuarios desaparecen.
	@Test
	public void PR14() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"/html/body/div/div/div/table/tbody/tr/td[1]");
		int numElementosAnt = elementos.size();

		elementos = PO_View.checkElement(driver, "free", "//input[@type='checkbox']");
		elementos.get(0).click();
		elementos.get(1).click();
		elementos.get(2).click();

		By boton = By.className("btn");
		driver.findElement(boton).click();

		elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/div/table/tbody/tr/td[1]");
		int numElementos = elementos.size();

		SeleniumUtils.esperarSegundos(driver, 10);
		assertEquals(numElementosAnt - 3, numElementos);
	}

	// PR15. Crear una nueva oferta válida /
	@Test
	public void PR15() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/ofertas/agregar')]");
		elementos.get(0).click();
		PO_AddProductView.fillForm(driver, "Camiseta", "camiseta azul de seda", "20");
		elementos = PO_View.checkElement(driver, "text", "Camiseta");
		assertTrue(elementos.get(0) != null);
	}

	// PR16. Intentar crear una oferta con datos inválidos /
	@Test
	public void PR16() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/ofertas/agregar')]");
		elementos.get(0).click();
		PO_AddProductView.fillForm(driver, "", "", "");
		elementos = PO_View.checkElement(driver, "text", "Título:");
		assertTrue(elementos.get(0) != null);
	}

	// PR017. Mostrar todas las ofertas del usuario /
	@Test
	public void PR17() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "1234");
		PO_View.checkElement(driver, "text", "Ladrillo");
		PO_View.checkElement(driver, "text", "Coche");
		PO_View.checkElement(driver, "text", "Borrador");
	}

	// PR18. Borrar la primera oferta de la lista /
	@Test
	public void PR18() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "1234");
		int numero = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/modificar/')]").size();
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/eliminar/')]");
		elementos.get(0).click();
		int numero2 = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/modificar/')]").size();
		assertEquals(numero - 1, numero2);
	}

	// PR19. Borrar la última oferta de la lista /
	@Test
	public void PR19() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "1234");
		int numero = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/modificar/')]").size();
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/eliminar/')]");
		elementos.get(elementos.size() - 1).click();
		int numero2 = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/modificar/')]").size();
		assertEquals(numero - 1, numero2);
	}

	// P20. Búsqueda con campo vacío / FALTA MEJORAR
	@Test
	public void PR20() {
		PO_SearchView.fillForm(driver, "");
		PO_View.checkElement(driver, "text", "Ladrillo");
		PO_View.checkElement(driver, "text", "Coche");
		PO_View.checkElement(driver, "text", "Borrador");
	}

	// PR21. Búsqueda inexistente /
	@Test
	public void PR21() {
		PO_SearchView.fillForm(driver, "udshiu,dxcgigdfgsc");
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Detalles:", PO_View.getTimeout());
	}

	// PR22. Búsqueda de un producto existente /
	@Test
	public void PR22() {
		PO_SearchView.fillForm(driver, "dri");
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Coche", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Borrador", PO_View.getTimeout());
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Ladrillo");
		assertTrue(elementos.size() == 1);
	}

	// PR23. Comprar una oferta y comprobar actualización del dinero /
	@Test
	public void PR23() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba10@test.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Ladrillo");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "text", "Comprar");
		elementos.get(0).click();
		PO_View.checkElement(driver, "text", "94€");
	}

	// PR24. Comprar una oferta y comprobar actualización del dinero a saldo 0 /
	@Test
	public void PR24() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Tambor");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "text", "Comprar");
		elementos.get(0).click();
		PO_View.checkElement(driver, "text", "0€");
	}

	// PR25. Intentar comprar una oferta sin saldo suficiente /
	@Test
	public void PR25() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba10@test.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Coche");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "text", "Comprar");
		elementos.get(0).click();
		PO_View.checkElement(driver, "text", "Saldo insuficiente");
	}

	// PR26. Comprobar que están las ofertas compradas por el usuario /
	@Test
	public void PR26() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba10@test.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Compras");
		elementos.get(0).click();
		PO_View.checkElement(driver, "text", "aaaaa");
	}

	// PR27. Al crear una oferta marcar dicha oferta como destacada y a continuación
	// comprobar: i)
	// que aparece en el listado de ofertas destacadas para los usuarios y que el
	// saldo del usuario se
	// actualiza adecuadamente en la vista del ofertante (-20).
	@Test
	public void PR27() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba10@test.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Publicaciones");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "text", "€");
		double saldoAnt = Double.valueOf(elementos.get(0).getText().split("-")[1].split("€")[0]);
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/ofertas/agregar')]");
		elementos.get(0).click();
		PO_AddProductView.fillForm2(driver, "Camiseta", "camiseta azul de seda", "20");
		elementos = PO_View.checkElement(driver, "text", "Camiseta");
		elementos = PO_View.checkElement(driver, "text", "€");
		double saldo = Double.valueOf(elementos.get(0).getText().split("-")[1].split("€")[0]);
		assertEquals(saldoAnt - 20, saldo, 0);
		elementos = PO_View.checkElement(driver, "free", "/html/body/div/div[3]/table/tbody/tr/td[1]");
		String elemento = elementos.get(elementos.size() - 1).getText();
		assertTrue(elemento.contains("Camiseta"));
	}

	// PR028.Sobre el listado de ofertas de un usuario con más de 20 euros de saldo,
	// pinchar en el
	// enlace Destacada y a continuación comprobar: i) que aparece en el listado de
	// ofertas destacadas
	// para los usuarios y que el saldo del usuario se actualiza adecuadamente en la
	// vista del ofertante (-
	// 20).
	@Test
	public void PR28() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "prueba10@test.com", "1234");
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "Publicaciones");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//table[contains(@name, 'destacadas')]//tbody/tr/td[1]");
		int destacadosAnt = elementos.size();

		elementos = PO_View.checkElement(driver, "text", "€");
		double saldoAnt = Double.valueOf(elementos.get(0).getText().split("-")[1].split("€")[0]);

		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/destacar')]");
		elementos.get(0).click();

		elementos = PO_View.checkElement(driver, "text", "€");
		double saldo = Double.valueOf(elementos.get(0).getText().split("-")[1].split("€")[0]);
		assertEquals(saldoAnt - 20, saldo, 0);

		elementos = PO_View.checkElement(driver, "free", "//table[contains(@name, 'destacadas')]//tbody/tr/td[1]");
		int destacados = elementos.size();

		assertEquals(destacadosAnt + 1, destacados);
	}

	// PR029.Sobre el listado de ofertas de un usuario con menos de 20 euros de
	// saldo, pinchar en el
	// enlace Destacada y a continuación comprobar que se muestra el mensaje de
	// saldo no suficiente.
	@Test
	public void PR29() {
		// Vamos al formulario de login
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "saldo0@saldo0.com", "saldo0");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/ofertas/agregar')]");
		elementos.get(0).click();
		PO_AddProductView.fillForm(driver, "Camiseta", "camiseta azul de seda", "20");
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/oferta/destacar')]");
		elementos.get(0).click();
		PO_View.checkElement(driver, "text", "Saldo insuficiente para destacar la oferta");
	}

	// PR030. Inicio de sesión con datos válidos
	@Test
	public void PR30() {
		driver.navigate().to("https://localhost:8081/cliente.html?w=login");
		PO_LoginView.fillForm(driver, "j@gmail.com", "1234");
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Password:", 2);

	}

	// PR031. Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta).
	@Test
	public void PR31() {
		driver.navigate().to("https://localhost:8081/cliente.html?w=login");
		PO_LoginView.fillForm(driver, "j@gmail.com", "12345");
		PO_View.checkElement(driver, "text", "Usuario no encontrado\n");

	}

	// PR032. Inicio de sesión con datos válidos (campo email o contraseña vacíos).
	@Test
	public void PR32() {
		driver.navigate().to("https://localhost:8081/cliente.html?w=login");
		PO_LoginView.fillForm(driver, "", "12345");
		PO_View.checkElement(driver, "text", "Usuario no encontrado\n");
		
		driver.navigate().to("https://localhost:8081/cliente.html?w=login");
		PO_LoginView.fillForm(driver, "j@gmail.com", "");
		PO_View.checkElement(driver, "text", "Usuario no encontrado\n");
	}

	// PR033. Mostrar el listado de ofertas disponibles y comprobar que se muestran todas las que
	//existen, menos las del usuario identificado.
	@Test
	public void PR33() {
		assertTrue("PR33 sin hacer", false);
	}

}
