package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_SearchView extends PO_NavView {
	static public void fillForm(WebDriver driver, String busquedap) {
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys(busquedap);
;

		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
}
